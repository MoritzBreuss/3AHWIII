using System.Text.Json.Serialization;

namespace IssTracker.Models;

public sealed class Astronaut
{
    [JsonPropertyName("name")]
    public string Name { get; init; } = string.Empty;

    [JsonPropertyName("craft")]
    public string Craft { get; init; } = string.Empty;
}
