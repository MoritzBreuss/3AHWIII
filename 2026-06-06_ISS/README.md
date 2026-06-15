# ISS Mission Board

Eine Blazor-Server-App (.NET 9), die die **Internationale Raumstation (ISS) live verfolgt**:
aktuelle Position auf einer Karte, ueberflogene Region und die Crew an Bord.

## Features

- 🛰️ **Live-Position** der ISS, automatische Aktualisierung alle 5 Sekunden.
- 🗺️ **Interaktive Karte** (Leaflet) mit Marker und abgeflogener Flugbahn.
- 🌍 **Reverse-Geocoding** im Browser: zeigt das ueberflogene Land bzw. „ueber dem Ozean".
- 👨‍🚀 **Crew-Anzeige** aller aktuell im All befindlichen Astronaut:innen, gruppiert nach Raumfahrzeug.
- ⚠️ **Robuste Fehlerbehandlung** mit verstaendlichen Meldungen bei API-Ausfaellen.

## Genutzte APIs

| Endpoint | Zweck |
| --- | --- |
| `api.open-notify.org/iss-now.json` | Aktuelle Position der ISS (Laenge/Breite, Zeitstempel). |
| `api.open-notify.org/astros.json` | Liste der Personen aktuell im Weltall. |

Beide APIs sind kostenlos und benoetigen keinen API-Key.

## Starten

```powershell
dotnet run --project .\IssTracker.csproj
```

Danach die im Terminal angezeigte URL (z. B. `https://localhost:5290`) im Browser oeffnen.

## Architektur (Kurzueberblick)

| Schicht | Dateien | Aufgabe |
| --- | --- | --- |
| UI | `Components/Pages/Home.razor`, `Crew.razor` | Dashboard und Crew-Ansicht. |
| Services | `Services/IssApiService.cs` | Ruft die open-notify-API ab und parst die Antworten. |
| Services | `Services/BrowserReverseGeocodingService.cs` | Ortsbestimmung ueber JS-Interop im Browser. |
| Modelle | `Models/*.cs` | Typisierte DTOs fuer API-Antworten und Telemetrie. |
| JS | `wwwroot/js/issMap.js` | Leaflet-Karte und Reverse-Geocoding im Browser. |

## Hinweise

- Die open-notify-Endpunkte laufen ueber `http`; in der App sind sie als externe Aufrufe ueber einen
  konfigurierten `HttpClient` (Timeout 10 s, eigener User-Agent) gekapselt.
- Das Projekt ist Teil der Solution `3AHWIII.sln`.
