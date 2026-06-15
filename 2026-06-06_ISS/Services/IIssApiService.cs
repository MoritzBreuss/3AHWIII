using IssTracker.Models;

namespace IssTracker.Services;

public interface IIssApiService
{
    Task<IssTelemetry> GetCurrentPositionAsync(CancellationToken cancellationToken = default);

    Task<AstronautManifest> GetAstronautsAsync(CancellationToken cancellationToken = default);
}
