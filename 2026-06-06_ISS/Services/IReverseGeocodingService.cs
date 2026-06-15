namespace IssTracker.Services;

public interface IReverseGeocodingService
{
    Task<string> GetLocationLabelAsync(double latitude, double longitude, CancellationToken cancellationToken = default);
}
