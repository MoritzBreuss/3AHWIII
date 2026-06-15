import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const publicDir = join(__dirname, "public");
const PORT = Number(process.env.PORT || 4173);

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8"
};

const dnsTypes = new Set(["A", "AAAA", "CNAME", "MX", "NS", "TXT", "SOA", "CAA"]);

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

function sanitizeDomain(value) {
  const domain = String(value || "").trim().toLowerCase();
  if (!/^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain)) {
    return null;
  }
  return domain;
}

function sanitizeIp(value) {
  const query = String(value || "").trim();
  const ipv4 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;
  const ipv6 = /^[0-9a-f:]{2,39}$/i;
  return ipv4.test(query) || (query.includes(":") && ipv6.test(query)) ? query : null;
}

function sanitizeCveQuery(value) {
  const query = String(value || "").trim();
  if (!query || query.length > 120) return null;
  return query;
}

async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeout || 10000);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "CyberSecurityDashboard/1.0",
        Accept: "application/json, text/plain, */*",
        ...options.headers
      },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchText(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeout || 10000);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "CyberSecurityDashboard/1.0",
        Accept: "application/rss+xml, application/xml, text/xml, text/plain",
        ...options.headers
      },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.text();
  } finally {
    clearTimeout(timeout);
  }
}

function decodeXml(value = "") {
  return value
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function pickTag(item, tag) {
  const match = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeXml(match[1]) : "";
}

function parseRss(xml, source) {
  return [...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)].slice(0, 8).map((match) => ({
    title: pickTag(match[0], "title"),
    link: pickTag(match[0], "link"),
    published: pickTag(match[0], "pubDate") || pickTag(match[0], "dc:date"),
    summary: pickTag(match[0], "description").slice(0, 220),
    source
  })).filter((item) => item.title && item.link);
}

function cveSeverity(cve) {
  const metrics = cve.metrics || {};
  const cvss31 = metrics.cvssMetricV31?.[0]?.cvssData;
  const cvss30 = metrics.cvssMetricV30?.[0]?.cvssData;
  const cvss2 = metrics.cvssMetricV2?.[0]?.cvssData;
  const selected = cvss31 || cvss30 || cvss2 || {};
  return {
    score: selected.baseScore ?? null,
    severity: selected.baseSeverity || metrics.cvssMetricV2?.[0]?.baseSeverity || "UNKNOWN",
    vector: selected.vectorString || ""
  };
}

function normalizeCve(entry) {
  const cve = entry.cve || entry;
  const description = cve.descriptions?.find((item) => item.lang === "en")?.value || "No description available.";
  const weaknesses = (cve.weaknesses || [])
    .flatMap((weakness) => weakness.description || [])
    .filter((item) => item.lang === "en")
    .map((item) => item.value);

  return {
    id: cve.id,
    published: cve.published,
    lastModified: cve.lastModified,
    description,
    weaknesses: [...new Set(weaknesses)].slice(0, 4),
    references: (cve.references?.referenceData || cve.references || []).slice(0, 5).map((ref) => ({
      url: ref.url,
      source: ref.source || "Reference"
    })),
    ...cveSeverity(cve)
  };
}

async function handleDns(reqUrl, res) {
  const domain = sanitizeDomain(reqUrl.searchParams.get("domain"));
  const type = String(reqUrl.searchParams.get("type") || "A").toUpperCase();

  if (!domain || !dnsTypes.has(type)) {
    sendJson(res, 400, { error: "Bitte eine gueltige Domain und einen gueltigen DNS-Typ angeben." });
    return;
  }

  const url = `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${encodeURIComponent(type)}`;
  const data = await fetchJson(url);
  sendJson(res, 200, {
    query: domain,
    type,
    status: data.Status,
    records: (data.Answer || []).map((record) => ({
      name: record.name,
      type: record.type,
      ttl: record.TTL,
      data: record.data
    })),
    authority: data.Authority || []
  });
}

async function handleRdap(reqUrl, res) {
  const raw = String(reqUrl.searchParams.get("query") || "").trim();
  const ip = sanitizeIp(raw);
  const domain = sanitizeDomain(raw);

  if (!ip && !domain) {
    sendJson(res, 400, { error: "Bitte eine gueltige IP-Adresse oder Domain angeben." });
    return;
  }

  const url = ip
    ? `https://rdap.org/ip/${encodeURIComponent(ip)}`
    : `https://rdap.org/domain/${encodeURIComponent(domain)}`;

  const data = await fetchJson(url);
  sendJson(res, 200, {
    query: raw,
    kind: ip ? "IP" : "Domain",
    name: data.name || data.ldhName || data.handle || raw,
    handle: data.handle || "",
    country: data.country || "",
    status: data.status || [],
    events: data.events || [],
    entities: (data.entities || []).slice(0, 6).map((entity) => ({
      handle: entity.handle,
      roles: entity.roles || [],
      vcard: entity.vcardArray?.[1]?.filter((row) => ["fn", "org", "email"].includes(row[0])).map((row) => row[3]) || []
    })),
    links: (data.links || []).slice(0, 4).map((link) => ({ href: link.href, rel: link.rel }))
  });
}

async function handleCve(reqUrl, res) {
  const query = sanitizeCveQuery(reqUrl.searchParams.get("query"));

  if (!query) {
    sendJson(res, 400, { error: "Bitte eine CVE-ID oder ein Suchwort angeben." });
    return;
  }

  const params = new URLSearchParams({ resultsPerPage: "8" });
  if (/^CVE-\d{4}-\d{4,}$/i.test(query)) {
    params.set("cveId", query.toUpperCase());
  } else {
    params.set("keywordSearch", query);
  }

  const data = await fetchJson(`https://services.nvd.nist.gov/rest/json/cves/2.0?${params}`);
  sendJson(res, 200, {
    query,
    totalResults: data.totalResults || 0,
    results: (data.vulnerabilities || []).map(normalizeCve)
  });
}

async function handleNews(res) {
  const feeds = [
    { source: "CISA", url: "https://www.cisa.gov/news-events/cybersecurity-advisories.xml" },
    { source: "The Hacker News", url: "https://feeds.feedburner.com/TheHackersNews" }
  ];

  const settled = await Promise.allSettled(feeds.map(async (feed) => parseRss(await fetchText(feed.url), feed.source)));
  const items = settled
    .filter((result) => result.status === "fulfilled")
    .flatMap((result) => result.value)
    .sort((a, b) => new Date(b.published || 0) - new Date(a.published || 0))
    .slice(0, 10);

  sendJson(res, 200, { updatedAt: new Date().toISOString(), items });
}

async function serveStatic(reqUrl, res) {
  const requestedPath = reqUrl.pathname === "/" ? "/index.html" : decodeURIComponent(reqUrl.pathname);
  const safePath = normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(publicDir, safePath);

  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const file = await readFile(filePath);
    res.writeHead(200, {
      "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-cache"
    });
    res.end(file);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

const server = createServer(async (req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host}`);

  try {
    if (reqUrl.pathname === "/api/health") {
      sendJson(res, 200, { status: "online", time: new Date().toISOString() });
      return;
    }

    if (reqUrl.pathname === "/api/dns") {
      await handleDns(reqUrl, res);
      return;
    }

    if (reqUrl.pathname === "/api/rdap") {
      await handleRdap(reqUrl, res);
      return;
    }

    if (reqUrl.pathname === "/api/cve") {
      await handleCve(reqUrl, res);
      return;
    }

    if (reqUrl.pathname === "/api/news") {
      await handleNews(res);
      return;
    }

    await serveStatic(reqUrl, res);
  } catch (error) {
    sendJson(res, 502, { error: "Die externe Abfrage konnte nicht abgeschlossen werden.", detail: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`Cyber Security Dashboard laeuft auf http://localhost:${PORT}`);
});
