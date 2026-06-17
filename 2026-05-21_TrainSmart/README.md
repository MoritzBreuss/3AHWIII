# TrainSmart

TrainSmart ist eine moderne Blazor Web App fuer ein persoenliches Running- und Fitness-Dashboard mit Strava-Daten.

## Funktionen

- Strava API Login mit Client ID, Client Secret, Authorization Code oder Refresh Token
- Dashboard mit Kilometern, Trainingszeit, Pace, Herzfrequenz, Hoehenmetern und persoenlichen Rekorden
- Diagramme fuer Wochenkilometer und Pace-Entwicklung
- Tabelle mit den letzten Aktivitaeten und separate Aktivitaetsuebersicht mit Suche und Sportartfilter
- Responsives Design fuer Desktop und mobile Geraete
- Demo-Datenmodus, falls gerade keine Strava-Zugangsdaten verfuegbar sind

## Starten

```powershell
dotnet restore
dotnet run
```

Danach die angezeigte lokale URL im Browser oeffnen, zum Beispiel:

```text
http://localhost:5242
```

## Strava einrichten

1. Auf https://www.strava.com/settings/api eine Strava-App erstellen.
2. In der App als Authorization Callback Domain `localhost` eintragen.
3. In TrainSmart die Client ID und das Client Secret eintragen.
4. Den Freigabelink erzeugen und die Scopes `read`, `activity:read_all` und `profile:read_all` bestaetigen.
5. Nach dem Redirect den Authorization Code verwenden oder alternativ einen Refresh Token einfuegen.

## Fehlerbehebung

- Wenn das Profil geladen wird, aber Aktivitaeten mit `401 Unauthorized` fehlschlagen, fehlt dem Token sehr wahrscheinlich `activity:read` oder `activity:read_all`.
- Die Strava-Freigabe wird mit `approval_prompt=force` geoeffnet, damit die Scope-Checkboxen erneut sichtbar sind. `activity:read_all` muss angehakt bleiben.
- Ein Authorization Code ist nur kurz gueltig und kann nur einmal verwendet werden. Wenn ein Code schon benutzt wurde, muss die Freigabe neu geoeffnet werden.
- Der Refresh Token kann sich bei jedem Refresh aendern. Immer den neuesten Refresh Token verwenden.

Die verwendeten API-Endpunkte sind:

- OAuth Authorize: `https://www.strava.com/oauth/authorize`
- Token Exchange und Refresh: `https://www.strava.com/oauth/token`
- Athlet: `https://www.strava.com/api/v3/athlete`
- Aktivitaeten: `https://www.strava.com/api/v3/athlete/activities`
