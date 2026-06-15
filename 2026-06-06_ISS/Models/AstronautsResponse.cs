using System.Text.Json.Serialization;

namespace IssTracker.Models;

public sealed class AstronautsResponse
{
    [JsonPropertyName("message")]
    public string? Message { get; init; }

    [JsonPropertyName("number")]
    public int Number { get; init; }

    [JsonPropertyName("people")]
    public List<Astronaut> People { get; init; } = [];
}
