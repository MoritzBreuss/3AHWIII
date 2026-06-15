# Strava REST-Collection

Sammlung von HTTP-Requests und einem PowerShell-Skript, um die [Strava-API](https://developers.strava.com/) auszuprobieren:
OAuth-Authorisierung, Token-Refresh, Athlet auslesen, Aktivitaeten auflisten und eine Aktivitaet anlegen.

## Inhalt

| Datei | Zweck |
| --- | --- |
| `apis.rest` | HTTP-Requests fuer den REST-Client (VS Code „REST Client" / JetBrains HTTP Client). |
| `run_strava.ps1` | Automatisiert den kompletten OAuth-Flow (Code-Tausch, Token-Refresh, Beispiel-Aufrufe). |

## Voraussetzungen

- Eine eigene Strava-App unter <https://www.strava.com/settings/api> (liefert `Client ID` und `Client Secret`).
- Fuer `apis.rest`: die VS-Code-Erweiterung **REST Client** oder der HTTP-Client in JetBrains Rider.

## Verwendung

### Variante A – `apis.rest`

1. In `apis.rest` die Platzhalter `YOUR_CLIENT_ID`, `YOUR_CLIENT_SECRET` und `YOUR_REFRESH_TOKEN` durch die eigenen Werte ersetzen.
2. Zuerst den Request **„Refresh access token"** ausfuehren – er besorgt einen frischen `access_token`.
3. Danach die uebrigen Requests (Athlet, Aktivitaeten, Aktivitaet anlegen) ausfuehren. Der Token wird automatisch wiederverwendet.

### Variante B – `run_strava.ps1`

```powershell
$env:STRAVA_CLIENT_ID = "<deine_client_id>"
$env:STRAVA_CLIENT_SECRET = "<dein_client_secret>"
.\run_strava.ps1
```

Das Skript oeffnet die Authorisierungs-URL im Browser, tauscht den `code` gegen Tokens, aktualisiert
den `@refreshToken` in `apis.rest` und ruft anschliessend einige Endpunkte beispielhaft auf.

## ⚠️ Sicherheit

Niemals echte `Client Secret`- oder Token-Werte committen. Die Dateien hier enthalten bewusst nur
Platzhalter. Lokale Werte ueber Umgebungsvariablen setzen oder direkt vor dem Ausfuehren eintragen
(und danach nicht einchecken).
