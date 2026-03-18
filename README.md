# 3AHWIII - Uebungen und Projekte

Dieses Repository enthaelt Uebungen aus dem Unterricht in Softwareentwicklung und Projektmanagement.
Die Projekte sind nach Datum und Thema organisiert.

## Inhalt auf einen Blick

- C# Grundlagen, OOP und Tests
- Bruch-Rechnungen und xUnit-Testprojekte
- Deno- und Prisma-Uebungen
- CSV-Auswertung mit CsvHelper

## Projektuebersicht

| Ordner | Thema | Technologie |
| --- | --- | --- |
| `2025-09-03/` | C# Grundlagen, MixedFraction | .NET |
| `2025-09-24/` | Erste Deno- und Prisma-Schritte | Deno, Prisma |
| `2025-10-08_deno_prisma_starter/` | Starterprojekt | Deno, Prisma |
| `2025-10-15_prisma_loginsystem/` | Login-System | Deno, Prisma |
| `2025-11-05_Brueche/` | Bruch-Klasse und Parsing | .NET |
| `2025-11-17_Bruch_test_xunit/` | Tests fuer Bruch-Klasse | .NET, xUnit |
| `2025-11-19/` | Kleines C# Teilprojekt | .NET |
| `2025-11-30/` | Projekt + Testprojekt in einer Solution | .NET, xUnit |
| `2026-01-07_CSV-helper/` | CSV lesen und ausgeben | .NET, CsvHelper |
| `2026-03-11_Inventarsystem/` | Hausuebung Interfaces und Inventar | .NET |
| `3AHWIII.Tests/` | Zentrales Testprojekt | .NET, xUnit |
| `Ferienprojekte/` | Frontend- und Fullstack-Experimente (HTML, Next.js, Node) | HTML, TypeScript, Next.js, Node.js |
| `test/` | Weitere Uebungs-/Experimentierprojekte | .NET |

## Schnellstart

### 1) Build ausfuehren

```powershell
dotnet build .\2025-11-05_Brueche\2025-11-05_Brueche.csproj
```

### 2) Programm starten

```powershell
dotnet run --project .\2025-11-05_Brueche\2025-11-05_Brueche.csproj
```

### 3) Tests laufen lassen

```powershell
dotnet test .\3AHWIII.Tests\3AHWIII.Tests.csproj
```

### 4) Deno-Projekt starten

```powershell
cd .\2025-10-08_deno_prisma_starter
deno run -A main.ts
```

## Reorganisation und Konventionen

- Datumspraefix (`YYYY-MM-DD`) fuer Unterrichtsstaende.
- Pro Thema ein eigener Ordner mit klar abgegrenztem Inhalt.
- Build-Artefakte und lokale Entwicklungsdateien sind per `.gitignore` ausgeschlossen.

## Naechste sinnvolle Schritte

- Pro Unterprojekt eine kurze README mit Ziel, Start und Test.
- Einheitliche Benennung neuer Uebungsordner nach Datum und Thema.
- Optional eine separate Solution fuer zusammengehoerige C# Projekte pro Monat.
