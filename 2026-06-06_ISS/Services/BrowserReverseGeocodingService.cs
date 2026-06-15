using Microsoft.JSInterop;

namespace IssTracker.Services;

public sealed class BrowserReverseGeocodingService(IJSRuntime jsRuntime) : IReverseGeocodingService
{
    public const string OceanLocationLabel = "Über dem Ozean / Internationales Gewässer";

    public async Task<string> GetLocationLabelAsync(
        double latitude,
        double longitude,
        CancellationToken cancellationToken = default)
    {
        var locationLabel = await jsRuntime.InvokeAsync<string>(
            "reverseGeocodeIssPosition",
            cancellationToken,
            latitude,
            longitude);

        return string.IsNullOrWhiteSpace(locationLabel)
            ? OceanLocationLabel
            : locationLabel;
    }
}
