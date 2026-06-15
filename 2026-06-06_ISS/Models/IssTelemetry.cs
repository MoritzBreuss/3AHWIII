namespace IssTracker.Models;

public sealed record IssTelemetry(
    double Latitude,
    double Longitude,
    DateTimeOffset Timestamp,
    string LocationLabel);
