using System;
using System.Collections.Generic;
using System.Linq;

namespace Lagerverwaltung;

internal class Program
{
    static void Main(string[] args)
    {
        Console.WriteLine("=== Hausuebung 25.03.2026: Lagerverwaltung ===");
        Console.WriteLine();

        // Schritt 1: Array (festes Regal)
        string[] regalPlaetze =
        {
            "Bremsscheibe",
            "Kupplung",
            "Lichtmaschine",
            "Filter",
            "Anlasser"
        };

        var sortiertesRegal = regalPlaetze.OrderBy(teil => teil).ToArray();

        Console.WriteLine("Schritt 1 - Regalplaetze (sortiert):");
        foreach (var teil in sortiertesRegal)
        {
            Console.WriteLine(teil);
        }

        Console.WriteLine();

        // Schritt 2: List (dynamische Einlagerung)
        List<string> eingangskorb = new();
        eingangskorb.Add("Schraube");
        eingangskorb.Add("Mutter");
        eingangskorb.Add("Bolzen");
        eingangskorb.Add("Feder");

        // Zweites Element entfernen (Index 1)
        eingangskorb.RemoveAt(1);

        Console.WriteLine("Schritt 2 - Eingangskorb:");
        if (eingangskorb.Contains("Schraube"))
        {
            Console.WriteLine("Schraube ist noch in der Liste enthalten.");
        }
        else
        {
            Console.WriteLine("Schraube ist nicht mehr in der Liste enthalten.");
        }

        Console.WriteLine($"Anzahl verbleibender Teile: {eingangskorb.Count}");

        Console.WriteLine();

        // Schritt 3: Dictionary (Such-System)
        Dictionary<int, string> artikelIndex = new()
        {
            { 101, "Motor" },
            { 102, "Getriebe" },
            { 103, "Reifen" }
        };

        Console.WriteLine("Schritt 3 - Artikelsuche:");
        FindArtikel(artikelIndex, 102);
        FindArtikel(artikelIndex, 999);

        Console.WriteLine();
        Console.WriteLine("Zusatzaufgabe - Alle Artikel:");
        foreach (var eintrag in artikelIndex)
        {
            Console.WriteLine($"ID: {eintrag.Key}, Teil: {eintrag.Value}");
        }

        Console.WriteLine();
        Console.WriteLine("=== Ende ===");
    }

    static void FindArtikel(Dictionary<int, string> artikelIndex, int id)
    {
        if (artikelIndex.TryGetValue(id, out string? teilName))
        {
            Console.WriteLine($"Artikel {id} gefunden: {teilName}");
        }
        else
        {
            Console.WriteLine($"Fehler: Artikel-ID {id} ist unbekannt.");
        }
    }
}
