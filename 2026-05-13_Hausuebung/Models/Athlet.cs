namespace _2026_05_13_Hausuebung.Models;

public sealed class Athlet
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public List<Aktivitaet> Aktivitaeten { get; set; } = new();
}