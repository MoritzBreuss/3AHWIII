# Public APIs Analyse und Projektvision

Dieses Dokument fasst meine Auswahl aus dem Repository [public-apis/public-apis](https://github.com/public-apis/public-apis) zusammen, enthält konkrete Verbesserungsvorschläge und beschreibt eine realistische App-Idee bis zum Semesterende.

## Auswahl: Meine 3 Lieblings-APIs

| API | Kategorie | Auth | Warum sie gut passt |
|---|---|---|---|
| Open Food Facts | Food & Drink | Keine | Sehr große Datenbank mit Nährwerten, Zutaten und Nutri-Score. Ideal, um Ernährung und Training gemeinsam zu betrachten. |
| OpenWeatherMap (Alternative: Weatherstack) | Weather | apiKey | Liefert aktuelles Wetter und Vorhersagen. Hilft bei der Entscheidung, ob ein Training draußen oder drinnen sinnvoll ist. |
| Strava | Sports & Fitness | OAuth | Bietet Zugriff auf Aktivitätsdaten wie Distanz, Pace, Herzfrequenz und Dauer. Perfekt für Trainingsanalyse und Fortschrittskontrolle. |

## Verbesserungs- und Änderungsvorschläge

Bezogen auf die ausgewählten APIs für meine Traum-App:

- **Open Food Facts:** Da die Daten teils von Nutzern stammen, sind Felder nicht immer vollständig. Eine clientseitige Validierung und Fallback-Werte (z. B. "Nährwert unbekannt") verbessern die Robustheit.
- **OpenWeatherMap:** Der API-Key sollte nicht im Frontend liegen. Sinnvoll ist ein kleiner Backend-Proxy, der den Key kapselt und Antworten cached (Rate-Limit schonen).
- **Strava:** Der OAuth-Flow ist aufwändig. Refresh-Tokens sollten serverseitig sicher gespeichert und Access-Tokens automatisch erneuert werden.

## Traum-App bis Ende Semester: TrainSmart Dashboard

TrainSmart ist ein Web-Dashboard, das Trainingsdaten von Strava.com anzeigt.


### Kernfunktionen 

1. Abrufen aller verfügbaren Aktivitäten
2. Anzeige von Basis- und Detailmetriken
3. Zugriff auf Rohdaten (Streams)
4. Export als Datei + Copy-to-Clipboard Funktion
5. Dashboard mit allen Daten und Visualisierungen: Diagramme (über Distanz und Zeit) sowie Tabellen.

### Technischer Plan

- **Frontend:** Blazor (passend zu den übrigen .NET-Projekten im Repository).
- **Datenzugriff:** Strava-API über die REST-Bausteine aus [`2026-05-20_rest/`](../2026-05-20_rest/).
- **Persistenz:** EF Core + SQLite (siehe [`2026-05-13_Hausuebung/`](../2026-05-13_Hausuebung/)).




