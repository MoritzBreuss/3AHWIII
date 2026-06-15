const state = {
  mode: "dns",
  log: []
};

const elements = {
  tabs: document.querySelectorAll(".tab"),
  lookupForm: document.querySelector("#lookupForm"),
  lookupInput: document.querySelector("#lookupInput"),
  lookupLabel: document.querySelector("#lookupLabel"),
  dnsType: document.querySelector("#dnsType"),
  resultPanel: document.querySelector("#resultPanel"),
  newsList: document.querySelector("#newsList"),
  activityLog: document.querySelector("#activityLog"),
  connectionStatus: document.querySelector("#connectionStatus"),
  refreshNewsButton: document.querySelector("#refreshNewsButton"),
  clearLogButton: document.querySelector("#clearLogButton"),
  severityFocus: document.querySelector("#severityFocus")
};

const modeConfig = {
  dns: {
    label: "Domain",
    placeholder: "example.com",
    value: "openai.com"
  },
  rdap: {
    label: "IP-Adresse oder Domain",
    placeholder: "8.8.8.8 oder example.com",
    value: "8.8.8.8"
  },
  cve: {
    label: "CVE-ID oder Suchwort",
    placeholder: "CVE-2024-3094 oder openssl",
    value: "CVE-2024-3094"
  }
};

function setMode(mode, keepValue = false) {
  state.mode = mode;
  elements.tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.mode === mode));
  elements.lookupLabel.textContent = modeConfig[mode].label;
  elements.lookupInput.placeholder = modeConfig[mode].placeholder;
  elements.dnsType.hidden = mode !== "dns";
  elements.dnsType.disabled = mode !== "dns";

  if (!keepValue) {
    elements.lookupInput.value = modeConfig[mode].value;
  }
}

function showLoading(title = "Abfrage laeuft") {
  elements.resultPanel.innerHTML = `
    <div class="loading-state">
      <strong>${title}</strong>
      <span>Externe Sicherheitsquelle wird abgefragt.</span>
    </div>
  `;
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDate(value) {
  if (!value) return "unbekannt";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("de-AT", { dateStyle: "medium", timeStyle: "short" });
}

async function apiGet(path) {
  const response = await fetch(path);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || "Abfrage fehlgeschlagen");
  }

  return payload;
}

function addLog(mode, query, status = "OK") {
  state.log.unshift({
    mode: mode.toUpperCase(),
    query,
    status,
    time: new Date()
  });
  state.log = state.log.slice(0, 8);
  renderLog();
}

function renderLog() {
  if (!state.log.length) {
    elements.activityLog.innerHTML = `<li>Noch keine Aktionen</li>`;
    return;
  }

  elements.activityLog.innerHTML = state.log.map((item) => `
    <li><strong>${escapeHtml(item.mode)}</strong> ${escapeHtml(item.query)} · ${escapeHtml(item.status)} · ${item.time.toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" })}</li>
  `).join("");
}

function renderDns(data) {
  const records = data.records.length
    ? data.records.map((record) => `
      <article class="record">
        <div class="meta">
          <span>Typ ${record.type}</span>
          <span>TTL ${record.ttl}s</span>
        </div>
        <code>${escapeHtml(record.data)}</code>
      </article>
    `).join("")
    : `<article class="record"><span class="error">Keine DNS-Records gefunden.</span></article>`;

  elements.resultPanel.innerHTML = `
    <div class="result-content">
      <div class="result-header">
        <div>
          <p class="eyebrow">DNS Lookup</p>
          <h3>${escapeHtml(data.query)}</h3>
        </div>
        <span class="badge">${escapeHtml(data.type)}</span>
      </div>
      <div class="record-grid">${records}</div>
    </div>
  `;
}

function renderRdap(data) {
  const events = data.events.slice(0, 5).map((event) => `
    <article class="record">
      <strong>${escapeHtml(event.eventAction || "Event")}</strong>
      <span>${escapeHtml(formatDate(event.eventDate))}</span>
    </article>
  `).join("");

  const entities = data.entities.map((entity) => `
    <article class="record">
      <strong>${escapeHtml((entity.roles || []).join(", ") || entity.handle || "Entity")}</strong>
      <span>${escapeHtml((entity.vcard || []).join(" · ") || "Keine Kontaktdaten")}</span>
    </article>
  `).join("");

  elements.resultPanel.innerHTML = `
    <div class="result-content">
      <div class="result-header">
        <div>
          <p class="eyebrow">WHOIS / RDAP</p>
          <h3>${escapeHtml(data.name)}</h3>
          <div class="meta">
            <span>${escapeHtml(data.kind)}</span>
            <span>${escapeHtml(data.country || "Land unbekannt")}</span>
            <span>${escapeHtml((data.status || []).join(", ") || "Status unbekannt")}</span>
          </div>
        </div>
        <span class="badge">${escapeHtml(data.handle || "RDAP")}</span>
      </div>
      <h3>Ereignisse</h3>
      <div class="record-grid">${events || `<article class="record">Keine Ereignisse gefunden.</article>`}</div>
      <h3>Kontakte</h3>
      <div class="record-grid">${entities || `<article class="record">Keine Entities gefunden.</article>`}</div>
    </div>
  `;
}

function renderCve(data) {
  const results = data.results.length
    ? data.results.map((item) => {
      const severityClass = String(item.severity || "").toLowerCase();
      return `
        <article class="record">
          <div class="result-header">
            <div>
              <h3>${escapeHtml(item.id)}</h3>
              <div class="meta">
                <span>Publiziert ${escapeHtml(formatDate(item.published))}</span>
                <span>${escapeHtml((item.weaknesses || []).join(", ") || "CWE unbekannt")}</span>
              </div>
            </div>
            <span class="badge ${severityClass}">${escapeHtml(item.severity)} ${item.score ?? ""}</span>
          </div>
          <p>${escapeHtml(item.description)}</p>
          <div class="meta">${(item.references || []).slice(0, 3).map((ref) => `<a href="${escapeHtml(ref.url)}" target="_blank" rel="noreferrer">${escapeHtml(ref.source)}</a>`).join("")}</div>
        </article>
      `;
    }).join("")
    : `<article class="record"><span class="error">Keine CVEs gefunden.</span></article>`;

  const top = data.results.find((item) => ["CRITICAL", "HIGH"].includes(item.severity));
  elements.severityFocus.textContent = top ? top.severity : "CVSS";

  elements.resultPanel.innerHTML = `
    <div class="result-content">
      <div class="result-header">
        <div>
          <p class="eyebrow">CVE Suche</p>
          <h3>${escapeHtml(data.query)}</h3>
        </div>
        <span class="badge">${data.totalResults} Treffer</span>
      </div>
      <div class="record-grid">${results}</div>
    </div>
  `;
}

function renderError(error) {
  elements.resultPanel.innerHTML = `
    <div class="empty-state">
      <strong class="error">Abfrage fehlgeschlagen</strong>
      <span>${escapeHtml(error.message)}</span>
    </div>
  `;
}

async function runLookup(event) {
  event?.preventDefault();
  const query = elements.lookupInput.value.trim();
  if (!query) return;

  showLoading();

  try {
    if (state.mode === "dns") {
      const data = await apiGet(`/api/dns?domain=${encodeURIComponent(query)}&type=${encodeURIComponent(elements.dnsType.value)}`);
      renderDns(data);
    }

    if (state.mode === "rdap") {
      const data = await apiGet(`/api/rdap?query=${encodeURIComponent(query)}`);
      renderRdap(data);
    }

    if (state.mode === "cve") {
      const data = await apiGet(`/api/cve?query=${encodeURIComponent(query)}`);
      renderCve(data);
    }

    addLog(state.mode, query);
  } catch (error) {
    renderError(error);
    addLog(state.mode, query, "Fehler");
  }
}

async function loadNews() {
  elements.newsList.innerHTML = `<div class="skeleton"></div><div class="skeleton short"></div><div class="skeleton"></div>`;

  try {
    const data = await apiGet("/api/news");
    if (!data.items.length) {
      elements.newsList.innerHTML = `<article class="news-item"><strong>Keine News gefunden</strong><p>Die RSS-Quellen haben aktuell keine Eintraege geliefert.</p></article>`;
      return;
    }

    elements.newsList.innerHTML = data.items.map((item) => `
      <a class="news-item" href="${escapeHtml(item.link)}" target="_blank" rel="noreferrer">
        <div class="meta">
          <span>${escapeHtml(item.source)}</span>
          <span>${escapeHtml(formatDate(item.published))}</span>
        </div>
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.summary)}</p>
      </a>
    `).join("");
  } catch (error) {
    elements.newsList.innerHTML = `<article class="news-item"><strong class="error">News konnten nicht geladen werden</strong><p>${escapeHtml(error.message)}</p></article>`;
  }
}

async function checkHealth() {
  try {
    const health = await apiGet("/api/health");
    elements.connectionStatus.textContent = `Online · ${formatDate(health.time)}`;
    elements.connectionStatus.classList.add("online");
  } catch {
    elements.connectionStatus.textContent = "Offline";
    elements.connectionStatus.classList.remove("online");
  }
}

elements.tabs.forEach((tab) => {
  tab.addEventListener("click", () => setMode(tab.dataset.mode));
});

document.querySelectorAll("[data-example]").forEach((button) => {
  button.addEventListener("click", () => {
    setMode(button.dataset.mode, true);
    elements.lookupInput.value = button.dataset.example;
    runLookup();
  });
});

elements.lookupForm.addEventListener("submit", runLookup);
elements.refreshNewsButton.addEventListener("click", loadNews);
elements.clearLogButton.addEventListener("click", () => {
  state.log = [];
  renderLog();
});

setMode("dns", true);
renderLog();
checkHealth();
loadNews();
