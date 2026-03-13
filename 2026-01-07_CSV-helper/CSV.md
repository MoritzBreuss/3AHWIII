# Was ist CSV?

CSV steht fuer Comma-Separated Values und ist ein einfaches Dateiformat fuer tabellarische Daten.
Jede Zeile ist ein Datensatz, einzelne Werte sind durch ein Trennzeichen (Delimiter) getrennt.

## Wichtige Begriffe

- **Delimiter (Trennzeichen)**
Trennt Werte innerhalb einer Zeile, zum Beispiel `,`, `;` oder `\t`.

- **Line Separator (Zeilentrenner)**
Trennt Zeilen in einer Datei, zum Beispiel `\n` (Unix), `\r\n` (Windows).

- **Record (Datensatz)**
Eine komplette Zeile mit zusammengehoerigen Werten.

- **Field (Feld)**
Ein einzelner Wert innerhalb eines Datensatzes.

- **Header (Kopfzeile)**
Die erste Zeile mit Spaltennamen. Optional, aber sehr hilfreich.

- **Encoding (Kodierung)**
Regelt die Zeichenkodierung, haeufig UTF-8 oder ASCII.

- **Quotation (Anfuehrungszeichen)**
Werte mit Sonderzeichen koennen in doppelte Anfuehrungszeichen gesetzt werden.
Beispiel: `"Wert, mit Komma"`

- **Escape Character (Fluchtzeichen)**
Kennzeichnet Sonderzeichen im Feldinhalt.
Beispiel: `"Wert mit \"Anfuehrungszeichen\""`

- **Dialect (Dialekt)**
Kombination aller CSV-Regeln eines Formats, zum Beispiel Delimiter, Quoting und Zeilentrenner.
