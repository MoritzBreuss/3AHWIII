namespace IssTracker.Models;

public sealed record AstronautManifest(
    int Count,
    IReadOnlyList<Astronaut> People);
