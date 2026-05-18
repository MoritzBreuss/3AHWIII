using System.Globalization;
using Microsoft.EntityFrameworkCore;
using _2026_05_13_Hausuebung.Data;
using _2026_05_13_Hausuebung.Models;

using var db = new StravaContext();
db.Database.EnsureCreated();

while (true)
{
    Console.Clear();
    Console.WriteLine("Strava-Aktivitätenverwaltung");
    Console.WriteLine("1 - Athleten anzeigen");
    Console.WriteLine("2 - Athlet hinzufügen");
    Console.WriteLine("3 - Athlet bearbeiten");
    Console.WriteLine("4 - Athlet löschen");
    Console.WriteLine("5 - Aktivitäten anzeigen");
    Console.WriteLine("6 - Aktivität hinzufügen");
    Console.WriteLine("7 - Aktivität bearbeiten");
    Console.WriteLine("8 - Aktivität löschen");
    Console.WriteLine("0 - Beenden");
    Console.WriteLine();
    Console.Write("Auswahl: ");

    var auswahl = Console.ReadLine();

    switch (auswahl)
    {
        case "1":
            ZeigeAthleten(db);
            Pause();
            break;
        case "2":
            ErstelleAthlet(db);
            Pause();
            break;
        case "3":
            BearbeiteAthlet(db);
            Pause();
            break;
        case "4":
            LoescheAthlet(db);
            Pause();
            break;
        case "5":
            ZeigeAktivitaeten(db);
            Pause();
            break;
        case "6":
            ErstelleAktivitaet(db);
            Pause();
            break;
        case "7":
            BearbeiteAktivitaet(db);
            Pause();
            break;
        case "8":
            LoescheAktivitaet(db);
            Pause();
            break;
        case "0":
            return;
        default:
            Console.WriteLine("Ungültige Auswahl.");
            Pause();
            break;
    }
}

static void ZeigeAthleten(StravaContext db)
{
    var athleten = db.Athleten
        .Include(a => a.Aktivitaeten)
        .OrderBy(a => a.Name)
        .ToList();

    Console.WriteLine("Athleten");

    if (athleten.Count == 0)
    {
        Console.WriteLine("Keine Athleten vorhanden.");
        return;
    }

    foreach (var athlet in athleten)
    {
        Console.WriteLine($"{athlet.Id}: {athlet.Name} ({athlet.Email}) - {athlet.Aktivitaeten.Count} Aktivitäten");
    }
}

static void ErstelleAthlet(StravaContext db)
{
    Console.Write("Name: ");
    var name = Console.ReadLine()?.Trim();

    Console.Write("E-Mail: ");
    var email = Console.ReadLine()?.Trim();

    if (string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(email))
    {
        Console.WriteLine("Name und E-Mail dürfen nicht leer sein.");
        return;
    }

    var athlet = new Athlet
    {
        Name = name,
        Email = email
    };

    db.Athleten.Add(athlet);
    db.SaveChanges();

    Console.WriteLine($"Athlet {athlet.Name} wurde gespeichert.");
}

static void BearbeiteAthlet(StravaContext db)
{
    var athlet = FindeAthlet(db);
    if (athlet is null)
    {
        return;
    }

    Console.Write($"Neuer Name ({athlet.Name}): ");
    var name = Console.ReadLine()?.Trim();
    Console.Write($"Neue E-Mail ({athlet.Email}): ");
    var email = Console.ReadLine()?.Trim();

    if (!string.IsNullOrWhiteSpace(name))
    {
        athlet.Name = name;
    }

    if (!string.IsNullOrWhiteSpace(email))
    {
        athlet.Email = email;
    }

    db.SaveChanges();
    Console.WriteLine("Athlet wurde aktualisiert.");
}

static void LoescheAthlet(StravaContext db)
{
    var athlet = FindeAthlet(db);
    if (athlet is null)
    {
        return;
    }

    db.Athleten.Remove(athlet);
    db.SaveChanges();
    Console.WriteLine("Athlet wurde gelöscht.");
}

static void ZeigeAktivitaeten(StravaContext db)
{
    var aktivitaeten = db.Aktivitaeten
        .Include(a => a.Athlet)
        .OrderByDescending(a => a.Datum)
        .ToList();

    Console.WriteLine("Aktivitäten");

    if (aktivitaeten.Count == 0)
    {
        Console.WriteLine("Keine Aktivitäten vorhanden.");
        return;
    }

    foreach (var aktivitaet in aktivitaeten)
    {
        Console.WriteLine($"{aktivitaet.Id}: {aktivitaet.Name} | {aktivitaet.Datum:dd.MM.yyyy} | {aktivitaet.DistanzKm} km | {aktivitaet.DauerMinuten} min | Athlet: {aktivitaet.Athlet?.Name}");
    }
}

static void ErstelleAktivitaet(StravaContext db)
{
    var athlet = FindeAthlet(db);
    if (athlet is null)
    {
        return;
    }

    var eingabe = EingabeAktivitaet();
    if (eingabe is null)
    {
        return;
    }

    var (name, datum, distanzKm, dauerMinuten) = eingabe.Value;

    var aktivitaet = new Aktivitaet
    {
        Name = name,
        Datum = datum,
        DistanzKm = distanzKm,
        DauerMinuten = dauerMinuten,
        AthletId = athlet.Id
    };

    db.Aktivitaeten.Add(aktivitaet);
    db.SaveChanges();

    Console.WriteLine("Aktivität wurde gespeichert.");
}

static void BearbeiteAktivitaet(StravaContext db)
{
    var aktivitaet = FindeAktivitaet(db);
    if (aktivitaet is null)
    {
        return;
    }

    Console.Write($"Neuer Name ({aktivitaet.Name}): ");
    var name = Console.ReadLine()?.Trim();
    Console.Write($"Neues Datum ({aktivitaet.Datum:dd.MM.yyyy}): ");
    var datumText = Console.ReadLine();
    Console.Write($"Neue Distanz in km ({aktivitaet.DistanzKm}): ");
    var distanzText = Console.ReadLine();
    Console.Write($"Neue Dauer in Minuten ({aktivitaet.DauerMinuten}): ");
    var dauerText = Console.ReadLine();

    if (!string.IsNullOrWhiteSpace(name))
    {
        aktivitaet.Name = name;
    }

    if (DateOnly.TryParseExact(datumText, "dd.MM.yyyy", CultureInfo.GetCultureInfo("de-DE"), DateTimeStyles.None, out var datum))
    {
        aktivitaet.Datum = datum;
    }

    if (decimal.TryParse(distanzText, NumberStyles.Number, CultureInfo.GetCultureInfo("de-DE"), out var distanzKm))
    {
        aktivitaet.DistanzKm = distanzKm;
    }

    if (int.TryParse(dauerText, out var dauerMinuten))
    {
        aktivitaet.DauerMinuten = dauerMinuten;
    }

    db.SaveChanges();
    Console.WriteLine("Aktivität wurde aktualisiert.");
}

static void LoescheAktivitaet(StravaContext db)
{
    var aktivitaet = FindeAktivitaet(db);
    if (aktivitaet is null)
    {
        return;
    }

    db.Aktivitaeten.Remove(aktivitaet);
    db.SaveChanges();
    Console.WriteLine("Aktivität wurde gelöscht.");
}

static Athlet? FindeAthlet(StravaContext db)
{
    ZeigeAthleten(db);
    Console.Write("Athlet-ID: ");

    if (!int.TryParse(Console.ReadLine(), out var id))
    {
        Console.WriteLine("Ungültige ID.");
        return null;
    }

    var athlet = db.Athleten.FirstOrDefault(a => a.Id == id);
    if (athlet is null)
    {
        Console.WriteLine("Athlet nicht gefunden.");
    }

    return athlet;
}

static Aktivitaet? FindeAktivitaet(StravaContext db)
{
    ZeigeAktivitaeten(db);
    Console.Write("Aktivitäts-ID: ");

    if (!int.TryParse(Console.ReadLine(), out var id))
    {
        Console.WriteLine("Ungültige ID.");
        return null;
    }

    var aktivitaet = db.Aktivitaeten.FirstOrDefault(a => a.Id == id);
    if (aktivitaet is null)
    {
        Console.WriteLine("Aktivität nicht gefunden.");
    }

    return aktivitaet;
}

static (string Name, DateOnly Datum, decimal DistanzKm, int DauerMinuten)? EingabeAktivitaet()
{
    Console.Write("Name der Aktivität: ");
    var name = Console.ReadLine()?.Trim();

    Console.Write("Datum (TT.MM.JJJJ): ");
    var datumText = Console.ReadLine();

    Console.Write("Distanz in km: ");
    var distanzText = Console.ReadLine();

    Console.Write("Dauer in Minuten: ");
    var dauerText = Console.ReadLine();

    if (string.IsNullOrWhiteSpace(name))
    {
        Console.WriteLine("Der Name darf nicht leer sein.");
        return null;
    }

    if (!DateOnly.TryParseExact(datumText, "dd.MM.yyyy", CultureInfo.GetCultureInfo("de-DE"), DateTimeStyles.None, out var datum))
    {
        Console.WriteLine("Ungültiges Datum.");
        return null;
    }

    if (!decimal.TryParse(distanzText, NumberStyles.Number, CultureInfo.GetCultureInfo("de-DE"), out var distanzKm))
    {
        Console.WriteLine("Ungültige Distanz.");
        return null;
    }

    if (!int.TryParse(dauerText, out var dauerMinuten))
    {
        Console.WriteLine("Ungültige Dauer.");
        return null;
    }

    return (name, datum, distanzKm, dauerMinuten);
}

static void Pause()
{
    Console.WriteLine();
    Console.WriteLine("Enter zum Fortfahren...");
    Console.ReadLine();
}