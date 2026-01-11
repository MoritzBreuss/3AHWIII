# Was ist  CSV?
CSV = Comma-Separated Values (auf Deutsch: durch Kommas getrennte Werte) ist ein einfaches Dateiformat, das verwendet wird, um tabellarische Daten zu speichern. Jede Zeile in einer CSV-Datei entspricht einer Datenzeile, und die einzelnen Werte innerhalb dieser Zeile sind durch ein Trennzeichen (normalerweise ein Komma) getrennt.
## wichtige Begriffe
- **Delimiter (Trennzeichen)**
was trennen Sie
1) Werte in einer Zeile
Separator, z.B. Komma (,), Semikolon (;) oder Tabulator (\t)
2) Zeilen in der Datei
Line Separator, z.B. Zeilenumbruch (\n) Standard oder (\r\n)(Windows) (\r)(Mac)
- **Record (Datensatz)**
Eine einzelne Zeile in der CSV-Datei, die eine Gruppe von zusammengehörigen Datenwerten darstellt.
- **Field (Feld)**
Ein einzelner Datenwert innerhalb eines Datensatzes.
- **Header (Kopfzeile)**
Die erste Zeile in einer CSV-Datei, die die Namen der Felder definiert.
Kopfzeilen sind optional, aber sie helfen dabei, die Daten zu verstehen.
- **Encoding (Kodierung)**
Die Methode, mit der Zeichen in Bytes umgewandelt werden. Häufig verwendete Kodierungen sind UTF-8 und ASCII.
- **Quotation (Anführungszeichen)**
Werte, die Sonderzeichen (wie das Trennzeichen selbst oder Zeilenumbrüche) enthalten, werden oft in Anführungszeichen gesetzt, um Verwechslungen zu vermeiden.
Beispiel: "Wert, mit Komma"
- **Escape Character (Fluchtzeichen)(z.B. \ )**
Ein Zeichen, das verwendet wird, um Sonderzeichen in einem Feld zu kennzeichnen, damit sie nicht als Trennzeichen interpretiert werden.
Beispiel: "Wert mit \"Anführungszeichen\""
- **Dialect (Dialekt)**
Eine spezifische Variante des CSV-Formats, die bestimmte Regeln für Trennzeichen, Anführungszeichen und andere Formatierungsoptionen definiert.
Kombination aller Einstellungen(Delimiter, Quotation, Escape Character, Line Separator)
