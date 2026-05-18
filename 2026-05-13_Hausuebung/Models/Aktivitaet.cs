namespace _2026_05_13_Hausuebung.Models;

public sealed class Aktivitaet
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public DateOnly Datum { get; set; }

    public decimal DistanzKm { get; set; }

    public int DauerMinuten { get; set; }

    public int AthletId { get; set; }

    public Athlet? Athlet { get; set; }
}