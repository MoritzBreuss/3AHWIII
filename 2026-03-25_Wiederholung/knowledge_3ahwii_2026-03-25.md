# Knowledge Check – 3AHWII

**Datum:** 24.03.2026  
**Themen:** Interfaces, ref/out, Strings, Schleifen (break/continue), ENUM, Fail Fast

**Punkte:** 85 (10 MC à 4 Punkte + 3 Freitext à 15 Punkte)

---

## Teil 1: Multiple-Choice (40 Punkte)

*Jede Frage hat 4 Antwortoptionen. Kreuze alle zutreffenden Optionen an.  
Pro Frage gibt es 4 Punkte: Für jede korrekt angekreuzte Option 1 Punkt, für jede korrekt nicht angekreuzte Option 1 Punkt.*

*Falls du eine Frage als mehrdeutig empfindest, kannst du sie mit `-` markieren und kurz begründen.*

---

### Frage 1: Interfaces – Grundlagen (4 Punkte)

Welche Aussagen über Interfaces in C# sind korrekt?

- [ ] A) Ein Interface kann Instanzfelder (z.B. `private int zahl;`) enthalten.
- [X] B) Ein Interface definiert nur Signaturen von Methoden, Properties oder Events, aber keine Implementierung.
- [X] C) Eine Klasse kann mehrere Interfaces gleichzeitig implementieren.
- [X] D) Eine Klasse, die ein Interface implementiert, muss alle Member des Interfaces bereitstellen.

---

### Frage 2: Interfaces – Polymorphie (4 Punkte)

Gegeben sei:

```csharp
interface IInventarGegenstand
{
    string Name { get; }
    string BeschreibeDich();
}

class Waffe : IInventarGegenstand { ... }
class Heiltrank : IInventarGegenstand { ... }
```

Welche Aussagen sind korrekt?

- [X] A) `List<IInventarGegenstand>` kann sowohl `Waffe`- als auch `Heiltrank`-Objekte aufnehmen.
- [ ] B) Man kann auf ein `Waffe`-Objekt in der Liste nur zugreifen, wenn man es explizit zu `Waffe` castet.
- [X] C) `foreach (var item in liste) { item.BeschreibeDich(); }` funktioniert für alle Objekte in der Liste.
- [ ] D) Eine Klasse kann nicht gleichzeitig `IInventarGegenstand` und ein anderes Interface implementieren.

---

### Frage 3: Interfaces vs. Klassen (4 Punkte)

Worin unterscheiden sich Interfaces von abstrakten Klassen in C#?

- [X] A) Eine abstrakte Klasse kann implementierte Methoden enthalten, ein Interface (vor C# 8) nicht.
- [X] B) Eine Klasse kann von mehreren Interfaces erben, aber nur von einer Basisklasse.
- [ ] C) Interfaces können Konstruktoren definieren.
- [ ] D) Abstrakte Klassen können nicht instanziiert werden, Interfaces hingegen schon.

---

### Frage 4: `out`-Parameter (4 Punkte)

Welche Aussagen über `out`-Parameter sind korrekt?

- [X] A) Eine Methode mit `out`-Parameter muss diesem Parameter zwingend einen Wert zuweisen, bevor sie zurückkehrt.
- [ ] B) Der an `out` übergebene Variable muss vor dem Aufruf initialisiert sein.
- [X] C) `out` wird verwendet, um mehrere Werte aus einer Methode zurückzugeben.
- [ ] D) `out`-Parameter werden als Wert (by value) übergeben.

---

### Frage 5: `ref` vs `out` (4 Punkte)

Was ist der Unterschied zwischen `ref` und `out`?

- [X] A) Bei `ref` muss die Variable vor dem Aufruf initialisiert sein, bei `out` nicht.
- [X] B) Bei `out` muss die Methode der Variable zwingend einen Wert zuweisen, bei `ref` nicht.
- [ ] C) `ref` und `out` sind völlig identisch und austauschbar.
- [X] D) Beide Schlüsselwörter bewirken, dass Änderungen an der Variable im Aufrufer sichtbar sind.

---

### Frage 6: String-Vergleich `==` vs `.Equals()` (4 Punkte)

```csharp
string a = "Hallo";
string b = "Hal" + "lo";
```

Welche Aussagen sind korrekt?

- [X] A) `a == b` gibt `true` zurück.
- [X] B) `a.Equals(b)` gibt `true` zurück.
- [ ] C) `==` vergleicht die Referenz (Speicheradresse), `.Equals()` vergleicht den Inhalt.
- [X] D) Bei Strings verhalten sich `==` und `.Equals()` in C# identisch, wenn beide Strings zur Laufzeit denselben Inhalt haben.

---

### Frage 7: StringBuilder (4 Punkte)

Wann ist die Verwendung von `StringBuilder` statt String-Konkatenation sinnvoll?

- [ ] A) Bei einmaliger Verkettung von zwei Strings.
- [X] B) Bei vielen String-Operationen in einer Schleife.
- [X] C) Wenn Strings in einem großen Puffer effizient zusammengebaut werden sollen.
- [ ] D) `StringBuilder` sollte immer verwendet werden, da er schneller ist als `+`.

---

### Frage 8: `break` in Schleifen (4 Punkte)

```csharp
for (int i = 0; i < 10; i++)
{
    if (i == 5) break;
    Console.WriteLine(i);
}
```

Welche Aussagen sind korrekt?

- [X] A) Die Ausgabe ist: `0 1 2 3 4`
- [ ] B) Die Ausgabe ist: `0 1 2 3 4 5`
- [X] C) `break` beendet die Schleife sofort und setzt mit dem Code nach der Schleife fort.
- [ ] D) Nach `break` wird die Schleife noch einmal vollständig durchlaufen.

---

### Frage 9: `continue` in Schleifen (4 Punkte)

```csharp
for (int i = 0; i < 5; i++)
{
    if (i == 2) continue;
    Console.WriteLine(i);
}
```

Welche Aussagen sind korrekt?

- [X] A) Die Ausgabe ist: `0 1 3 4`
- [ ] B) Die Ausgabe ist: `0 1 2 3 4`
- [X] C) `continue` überspringt den Rest des aktuellen Schleifendurchlaufs und fährt mit dem nächsten Durchlauf fort.
- [ ] D) `continue` beendet die gesamte Schleife.

---

### Frage 10: ENUM und Fail Fast (4 Punkte)

Welche Aussagen sind korrekt?

- [X] A) Ein `enum` in C# ist ein Wertetyp, der eine Gruppe benannter Konstanten definiert.
- [X] B) "Fail Fast" bedeutet, Fehler so früh wie möglich zu erkennen und zu behandeln (z.B. durch frühe `throw`-Anweisungen).
- [ ] C) Bei "Fail Fast" werden Fehler am Ende der Methode gesammelt und dann geworfen.
- [X] D) Enums können nur numerische Werte (`int` standardmäßig) annehmen.

---

## Teil 2: Freitext-Fragen (45 Punkte)

### Aufgabe 1: Interface entwerfen und implementieren (15 Punkte)

**Ausgangslage:** Du sollst ein System für verschiedene Fahrzeuge entwerfen.

**Aufgaben:**

a) **(3 Punkte)** Definiere ein Interface `IFahrzeug` mit:
   - Property `string Typ { get; }`
   - Methode `string StarteMotor()`
    interface IFahrzeug
    {
        string Typ { get; }
        string StarteMotor();
    }

b) **(6 Punkte)** Implementiere zwei Klassen `Auto` und `Fahrrad`, die `IFahrzeug` implementieren:
   - `Auto`: `Typ` gibt "Auto" zurück, `StarteMotor()` gibt "Motor läuft"
   - `Fahrrad`: `Typ` gibt "Fahrrad" zurück, `StarteMotor()` gibt "Fahrräder haben keinen Motor"
``` csharp
    class Auto : IFahrzeug
    {
        public string Typ
        {
            get { return "Auto"; }
        }

        public string StarteMotor()
        {
            return "Motor läuft";
        }
    }

    class Fahrrad : IFahrzeug
    {
        public string Typ
        {
            get { return "Fahrrad"; }
        }

        public string StarteMotor()
        {
            return "Fahrräder haben keinen Motor";
        }
    }
```
c) **(3 Punkte)** Schreibe Code, der eine `List<IFahrzeug>` erstellt, ein Auto und ein Fahrrad hinzufügt, und dann in einer Schleife für jedes Fahrzeug `Typ` und `StarteMotor()` ausgibt.
``` csharp
    List<IFahrzeug> fahrzeuge = new List<IFahrzeug>();
    fahrzeuge.Add(new Auto());
    fahrzeuge.Add(new Fahrrad());

    for (int i = 0; i < fahrzeuge.Count; i++)
    {
        Console.WriteLine(fahrzeuge[i].Typ + ": " + fahrzeuge[i].StarteMotor());
    }
```
d) **(3 Punkte)** Erkläre kurz (2-3 Sätze), warum es sinnvoll ist, beide Klassen in derselben Liste zu speichern.
     Weil beide das Interface IFahrzeug implementieren, kann man sie einheitlich behandeln. die Schleife funktioniert für jeden Typ ohne extra if-Abfragen. Wenn man später ein drittes Fahrzeug hinzufügt, muss man am restlichen Code nichts ändern.
---

### Aufgabe 2: `ref` und `out` – Fehler finden und korrigieren (15 Punkte)

**Ausgangslage:** Der folgende Code enthält mehrere Fehler im Umgang mit `ref` und `out`.

```csharp
class Program
{
    static void Main()
    {
        int x;           // Zeile 5
        int y = 10;      // Zeile 6
        
        Berechne(x, out y);  // Zeile 8
        
        Verdopple(ref x);     // Zeile 10
    }
    
    static void Berechne(out int a, out int b)
    {
        b = a * 2;  // Zeile 15
    }
    
    static void Verdopple(ref int zahl)
    {
        // nichts hier
    }
}
```

**Aufgaben:**

a) **(6 Punkte)** Finde alle Fehler im Code und beschreibe für jeden Fehler:
   - Zeilennummer
   - Was ist falsch?
   - Warum ist es falsch?

    Zeile 8: Berechne(x, out y)  das erste Argument muss out x sein, nicht nur x, weil die Methode out int a erwartet.
    Zeile 10: Verdopple(ref x) Fheler: x ist nicht initailisiert (Zeile 5) ref verlangt aber eine initialisierte Variable.
    Zeile 15: b = a * 2 Fehler: a ist ein out-Parameter und wurde noch nicht zugewiesen. out-Parameter dürfen nicht gelesen werden bevor sie einen Wert haben.

b) **(6 Punkte)** Schreibe den korrigierten Code.
``` csharp
class Program
{
    static void Main()
    {
        int x;
        int y;

        Berechne(out x, out y);

        Verdopple(ref x);
    }

    static void Berechne(out int a, out int b)
    {
        a = 5;
        b = a * 2;
    }

    static void Verdopple(ref int zahl)
    {
        zahl *= 2;
    }
}
```
c) **(3 Punkte)** Erkläre den Unterschied zwischen `ref` und `out` in 2-3 Sätzen.
Bei ref muss die Varaible vor dem Aufruf schon einen Wert haben bei out nicht. Dafür muss die Methode bei out der Variable auf jeden Fall einen Wert zuweisen bei ref nicht. Beide übergeben die Variable per Referenz, also sind Änderungen in der Methode auch außerhalb sihctbar.
---

### Aufgabe 3: `break` und `continue` anwenden (15 Punkte)

**Ausgangslage:** Du hast ein Array mit Artikelnamen:

```csharp
string[] artikel = { "Apfel", "Banane", "Kiwi", "Orange", "Mango" };
```

**Aufgaben:**

a) **(5 Punkte)** Schreibe eine Schleife, die alle Artikel ausgibt, aber die Schleife mit `break` beendet, sobald "Kiwi" gefunden wird.  
   *Erwartete Ausgabe:* `Apfel Banane`
``` csharp
    foreach (var a in artikel)
    {
        if (a == "Kiwi") break;
        Console.WriteLine(a);
    }
```
b) **(5 Punkte)** Schreibe eine Schleife, die alle Artikel ausgibt, die länger als 5 Zeichen sind. Verwende `continue`, um kürzere Artikel zu überspringen.  
   *Erwartete Ausgabe:* `Banane Orange`
   ``` csharp
    foreach (var a in artikel)
    {
        if (a.Length <= 5) continue;
        Console.WriteLine(a);
    }
```
c) **(5 Punkte)** Erkläre den Unterschied zwischen `break` und `continue` und gib je ein sinnvolles Einsatzszenario an.
break beendet die gesamte Schleife sofort continue überspringt nur den aktuellen Durchlauf und macth mit dem nächsten weiter. break macht Sinn wen nman ein gesuchtes Element gefunden hat und nicht wietersuchen muss; z.B. erstes passendes Produkt in einer Liste. continue ist sinnvoll wenn man bestimmte Elemente überspringen will; z.B. ungültige oder leere Einträge in einem Array.

---

## Bewertung

| Teil | Punkte |
|------|--------|
| MC-Fragen (10 × 4) | 40 |
| Freitext (3 × 15) | 45 |
| **Gesamt** | **85** |

---

**Gutes Gelingen!**
