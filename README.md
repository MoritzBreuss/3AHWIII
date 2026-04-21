# 3AHWIII - Uebungen und Projekte

Dieses Repository sammelt die Unterrichts- und Uebungsprojekte der 3AHWIII im Fach Softwareentwicklung und Projektmanagement.
Die Inhalte sind  nach Datum und Thema organisiert und nutzen je nach Woche unterschiedliche Technologien.

## Was du hier findest

- .NET-Projekte (Grundlagen, OOP, Konsolenanwendungen, Tests)
- xUnit-Testprojekte
- Deno- und Prisma-Uebungen
- kleinere Web- und Ferienprojekte (z. B. Next.js)

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

## Konventionen

- Ordnernamen folgen moeglichst dem Muster `YYYY-MM-DD_Thema`.
- Pro Unterrichtsstand gibt es einen eigenen, klar abgegrenzten Ordner.
- Lokale Build-Artefakte und Entwicklungsdateien sind per `.gitignore` ausgeschlossen.

## Hinweis

Nicht alle Unterordner sind Teil der Root-Solution `3AHWIII.sln`.
Einige Projekte sind bewusst separat gehalten (z. B. Deno-, Blazor- oder Ferienprojekte) und haben eigene Startbefehle.
