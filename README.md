# 3AHWIII - Uebungen und Projekte

![.NET](https://img.shields.io/badge/.NET-9.0-512BD4?logo=dotnet&logoColor=white)
![C#](https://img.shields.io/badge/C%23-12-239120?logo=csharp&logoColor=white)
![Blazor](https://img.shields.io/badge/Blazor-Server-512BD4?logo=blazor&logoColor=white)
![Tests](https://img.shields.io/badge/Tests-xUnit-5C2D91)

Dieses Repository sammelt die Unterrichts- und Uebungsprojekte der 3AHWIII im Fach Softwareentwicklung und Projektmanagement.
Die Inhalte sind nach Datum und Thema organisiert und nutzen je nach Woche unterschiedliche Technologien.

## Was du hier findest

- .NET-Projekte (Grundlagen, OOP, Konsolenanwendungen, Tests)
- xUnit-Testprojekte
- Deno- und Prisma-Uebungen
- Web-Apps mit Blazor (z. B. ein Live-ISS-Tracker)
- REST-/API-Uebungen (Strava, EF Core, SQLite)
- kleinere Web- und Ferienprojekte (z. B. Next.js)

## Highlights

- **[ISS Mission Board](2026-06-06_ISS/)** – Blazor-App, die die Internationale Raumstation live auf einer Leaflet-Karte verfolgt und die aktuelle Crew anzeigt.
- **[Strava REST-Collection](2026-05-20_rest/)** – `.http`-Requests und ein PowerShell-Skript fuer den kompletten OAuth-Flow gegen die Strava-API.
- **[Strava Datenbank (EF Core)](2026-05-13_Hausuebung/)** – Persistierung von Aktivitaeten und Athleten in SQLite.

## Projektstruktur (Stand: 2026)

| Ordner | Inhalt | Technologie |
| --- | --- | --- |
| `2025-09-03/` | C# Grundlagen und erste Klassen | .NET 9 |
| `2025-09-24/` | Erste Schritte mit Deno und Prisma | Deno, Prisma |
| `2025-10-08_deno_prisma_starter/` | Deno/Prisma Starterprojekt | Deno, Prisma |
| `2025-10-15_prisma_loginsystem/` | Login-System mit Prisma | Deno, Prisma |
| `2025-11/`, `2025-11-05_Brueche/`, `2025-11-17_Bruch_test_xunit/`, `2025-11-19/`, `2025-11-30/` | Bruch-Themen, kleine Teilprojekte und Tests | .NET, xUnit |
| `2026-01-07_CSV-helper/` | CSV-Verarbeitung mit CsvHelper | .NET 8, CsvHelper |
| `2026-03-11_Inventarsystem/`, `2026-03-18_Einkaufsliste/`, `2026-03-25_Lagerverwaltung/`, `2026-03-25_Wiederholung/` | Uebungen zu Interfaces, Listen und Verwaltungssystemen | .NET |
| `2026-04-08_Inference/`, `2026-04-15_Inference/`, `2026-04-15_APIs/`, `2026-04-15_Blazor/` | Inference-, API- und Blazor-Uebungen | .NET, Web |
| `2026-05-13_Hausuebung/` | Strava-Daten mit EF Core in SQLite speichern | .NET 9, EF Core, SQLite |
| `2026-05-20_rest/` | Strava REST-Requests und OAuth-Automatisierung | REST Client, PowerShell |
| `2026-06-06_ISS/` | Live-Tracker der ISS mit Karte und Crew-Anzeige | .NET 9, Blazor, Leaflet |
| `3AHWIII.Tests/` | Zentrales Testprojekt fuer die Solution | .NET 9, xUnit |
| `Ferienprojekte/` | Freie Frontend-/Fullstack-Experimente | HTML, TypeScript, Next.js, Node.js |


## Schnellstart

### 1) Gesamte Solution bauen

```powershell
dotnet build .\3AHWIII.sln
```

### 2) Tests ausfuehren

```powershell
dotnet test .\3AHWIII.Tests\3AHWIII.Tests.csproj
```

### 3) Beispielprojekt starten (.NET)

```powershell
dotnet run --project .\2025-11-05_Brueche\2025-11-05_Brueche.csproj
```

### 4) Beispielprojekt starten (Deno)

```powershell
cd .\2025-10-08_deno_prisma_starter
deno run -A main.ts
```

### 5) ISS Mission Board starten (Blazor)

```powershell
dotnet run --project .\2026-06-06_ISS\IssTracker.csproj
```

Anschliessend die im Terminal angezeigte URL (z. B. `https://localhost:5290`) im Browser oeffnen.

## Konventionen

- Ordnernamen folgen moeglichst dem Muster `YYYY-MM-DD_Thema`.
- Pro Unterrichtsstand gibt es einen eigenen, klar abgegrenzten Ordner.
- Lokale Build-Artefakte und Entwicklungsdateien sind per `.gitignore` ausgeschlossen.

## Sicherheit

- Keine echten Secrets, API-Keys oder Tokens committen. Zugangsdaten gehoeren in `.env`-Dateien oder Umgebungsvariablen (siehe `.gitignore`).
- Die Strava-Beispiele unter `2026-05-20_rest/` verwenden bewusst Platzhalter (`YOUR_CLIENT_SECRET`).
- Die Strava-API-Anbindung kann aktuell nicht mehr praktisch genutzt werden, da Strava fuer den benoetigten API-Zugriff inzwischen eine kostenpflichtige Subscription voraussetzt. Die vorhandenen REST-Requests und Skripte bleiben im Repository erhalten, weil sie den OAuth-Flow und die grundsaetzliche Arbeit mit externen APIs dokumentieren.

## Moegliche Erweiterungen (Ideen)

- **CI/CD:** GitHub-Actions-Workflow, der bei jedem Push `dotnet build` und `dotnet test` ausfuehrt (Status-Badge im README).
- **TrainSmart-Dashboard:** Die Strava-Bausteine (`2026-05-13_Hausuebung`, `2026-05-20_rest`) zu einer Blazor-App mit Diagrammen zusammenfuehren.
- **ISS-Tracker ausbauen:** Flugbahn-Vorhersage, Pass-Over-Benachrichtigungen fuer den eigenen Standort, Verlauf der letzten Positionen.
- **Mehr Tests:** Unit-Tests fuer die ISS-Services (`IssApiService`) und die EF-Core-Schicht erhoehen die Abdeckung.
- **LICENSE & CONTRIBUTING:** Lizenzdatei (z. B. MIT) und kurze Beitragsrichtlinien runden das Repository ab.
- **Dependabot/Renovate:** Automatische Updates der NuGet- und npm-Pakete.

## Hinweis

Nicht alle Unterordner sind Teil der Root-Solution `3AHWIII.sln`.
Einige Projekte sind bewusst separat gehalten (z. B. Deno-, Blazor- oder Ferienprojekte) und haben eigene Startbefehle.
