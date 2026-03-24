using EinkaufslisteUebung;

Einkaufsliste liste = new Einkaufsliste();

string[] artikelZumHinzufuegen =
[
    "Milch",
    "Brot",
    "Eier",
    "Kaese",
    "Reis",
    "Apfel",
    "Saft",
    "Nudeln",
    "Mehl",
    "Salz",
    "Zucker"
];

foreach (string artikel in artikelZumHinzufuegen)
{
    bool erfolgreich = liste.VersucheHinzufuegen(artikel, out string meldung);
    Console.WriteLine($"{(erfolgreich ? "OK" : "FEHLER")}: {meldung}");
}

Console.WriteLine();
Console.WriteLine($"Aktuelle Anzahl: {liste.Anzahl}");
Console.WriteLine($"Enthaelt 'Milch': {liste.Enthaelt("Milch")}");
Console.WriteLine($"Enthaelt 'Kaffee': {liste.Enthaelt("Kaffee")}");

Console.WriteLine();
Console.WriteLine("Artikel kuerzer als 6 Zeichen:");
liste.GibKurzeNamenAus(6);

Console.WriteLine();
string a = "Milch";
string b = "Mil" + "ch";
Einkaufsliste.VergleicheStrings(a, b);
