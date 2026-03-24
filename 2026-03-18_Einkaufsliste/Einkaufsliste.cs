namespace EinkaufslisteUebung;

public class Einkaufsliste
{
    private readonly string[] _artikel = new string[10];
    private int _anzahl;

    public int Anzahl => _anzahl;

    public bool VersucheHinzufuegen(string artikel, out string meldung)
    {
        if (string.IsNullOrWhiteSpace(artikel))
        {
            meldung = "Artikelname darf nicht leer sein.";
            return false;
        }

        if (_anzahl >= _artikel.Length)
        {
            meldung = "Die Einkaufsliste ist voll (maximal 10 Artikel).";
            return false;
        }

        _artikel[_anzahl] = artikel;
        _anzahl++;
        meldung = $"Artikel '{artikel}' wurde hinzugefuegt.";
        return true;
    }

    public bool Enthaelt(string gesuchterArtikel)
    {
        bool gefunden = false;

        for (int i = 0; i < _anzahl; i++)
        {
            if (string.Equals(_artikel[i], gesuchterArtikel, StringComparison.OrdinalIgnoreCase))
            {
                gefunden = true;
                break;
            }
        }

        return gefunden;
    }

    public void GibKurzeNamenAus(int minLaenge)
    {
        for (int i = 0; i < _anzahl; i++)
        {
            string artikel = _artikel[i];

            if (artikel.Length >= minLaenge)
            {
                continue;
            }

            Console.WriteLine($"- {artikel} ({artikel.Length} Zeichen)");
        }
    }

    public static void VergleicheStrings(string a, string b)
    {
        bool vergleichMitOperator = a == b;
        bool vergleichMitEquals = a.Equals(b, StringComparison.Ordinal);
        bool gleichesErgebnis = vergleichMitOperator == vergleichMitEquals;

        Console.WriteLine($"a: {a}");
        Console.WriteLine($"b: {b}");
        Console.WriteLine($"a == b: {vergleichMitOperator}");
        Console.WriteLine($"a.Equals(b): {vergleichMitEquals}");
        Console.WriteLine($"Gleiches Ergebnis: {gleichesErgebnis}");
    }
}
