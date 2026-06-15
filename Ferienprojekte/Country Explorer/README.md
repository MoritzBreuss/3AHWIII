# Country Explorer

> Länder der Welt erkunden, vergleichen und sein Geografie-Wissen im Quiz testen.

Eine Single-Page-Webanwendung in reinem HTML/CSS/JavaScript. Sie zeigt zu jedem Land
Hauptstadt, Bevölkerung, Währung, Sprachen und Flagge, bietet eine interaktive Weltkarte
zum Anklicken, einen Länder-Vergleich und mehrere Quiz-Modi.

---

## Features

| Bereich | Detail |
|---------|--------|
| **Entdecken** | Alle Länder als Raster, Suche nach Name/Hauptstadt, Filter nach Region, Sortierung nach Name/Bevölkerung/Fläche |
| **Detailansicht** | Hauptstadt, Bevölkerung, Fläche, Bevölkerungsdichte, Währung, Sprachen, Region & Subregion |
| **Interaktive Karte** | Leaflet-Weltkarte mit klickbaren Ländergrenzen (Hover = Name, Klick = Details) |
| **Vergleich** | Zwei Länder Seite an Seite, der jeweils größere Wert wird hervorgehoben |
| **Quiz** | 3 Modi: *Flagge → Land*, *Hauptstadt*, *Größere Bevölkerung* – mit Punktestand |
| **Dark / Light Mode** | CSS `[data-theme]` auf `<html>`, gespeichert in `localStorage` |

---

## Tech Stack

| Layer | Technologie |
|-------|------------|
| Sprache | Vanilla HTML / CSS / JavaScript (kein Build-Schritt) |
| Länderdaten | lokal gebündelt in `countries.json` (250 Länder, kein API-Key/Limit) |
| Datenquellen | [mledoze/countries](https://github.com/mledoze/countries) + Bevölkerung aus [country-json](https://github.com/samayo/country-json) |
| Karte | [Leaflet](https://leafletjs.com) + Ländergrenzen-GeoJSON |
| Flaggen | [flagcdn.com](https://flagcdn.com) (über den ISO-Code) |
| Hosting | Vercel (statisch) |

---

## Projektstruktur

```
Country Explorer/
├── index.html      # komplette App-Logik & UI
├── countries.json  # lokal gebündelte Länderdaten (250 Länder)
├── vercel.json     # Security-Header inkl. Content-Security-Policy
├── .gitignore
└── README.md
```

---

## Lokal starten

Kein Build nötig. `index.html` direkt im Browser öffnen oder einen statischen Server nutzen:

```bash
npx serve .
```

> Hinweis: Die Länderdaten sind lokal gebündelt. Eine Internetverbindung wird nur für
> die Flaggenbilder (flagcdn) und die Kartengrenzen (GeoJSON) zur Laufzeit benötigt.

---

## Deployment

```bash
vercel --prod
```

---

## Mögliche Erweiterungen

- Nachbarländer (`borders`) anzeigen und im Detail verlinken.
- Quiz-Modus „Land auf der Karte finden".
- Favoriten/zuletzt angesehene Länder in `localStorage` merken.
- Diagramme (z. B. Top-10 nach Bevölkerung) als zusätzliche Ansicht.
