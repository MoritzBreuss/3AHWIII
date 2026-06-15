# Cyber Security Dashboard

Modernes Security-Dashboard fuer DNS-, WHOIS/RDAP-, CVE- und Cybersecurity-News-Abfragen.

## Start

```powershell
npm start
```

Danach im Browser oeffnen:

```text
http://localhost:4173
```

## Funktionen

- DNS-Abfragen ueber Google DNS-over-HTTPS
- WHOIS-aehnliche IP- und Domain-Abfragen ueber RDAP
- CVE-Suche ueber die NVD API 2.0
- Cybersecurity-News aus RSS-Feeds
- Aktivitaetsverlauf und responsive Dashboard-Oberflaeche

## Projektstruktur

```text
Cyber Security Dashboard/
├── package.json
├── server.js
├── README.md
└── public/
    ├── index.html
    ├── styles.css
    ├── app.js
    └── assets/
        └── signal-map.svg
```
