using System.Text.Json.Serialization;

namespace IssTracker.Models;

public sealed class IssPositionResponse
{
    [JsonPropertyName("message")]
    public string? Message { get; init; }

    [JsonPropertyName("timestamp")]
    public long Timestamp { get; init; }

    [JsonPropertyName("iss_position")]
    public IssPositionPayload? Position { get; init; }
}

public sealed class IssPositionPayload
{
    [JsonPropertyName("latitude")]
    public string? Latitude { get; init; }

    [JsonPropertyName("longitude")]
    public string? Longitude { get; init; }
}
