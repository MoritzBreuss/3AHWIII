namespace IssTracker.Models;

public sealed record FlightPathPoint(
    double Latitude,
    double Longitude,
    DateTimeOffset Timestamp);
