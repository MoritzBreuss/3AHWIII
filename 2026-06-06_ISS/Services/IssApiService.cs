using System.Globalization;
using System.Text.Json;
using IssTracker.Models;

namespace IssTracker.Services;

public sealed class IssApiService(IHttpClientFactory httpClientFactory) : IIssApiService
{
    public const string HttpClientName = "IssApi";

    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private static readonly Uri IssPositionEndpoint = new("http://api.open-notify.org/iss-now.json");
    private static readonly Uri AstronautsEndpoint = new("http://api.open-notify.org/astros.json");

    private readonly HttpClient _httpClient = httpClientFactory.CreateClient(HttpClientName);

    public async Task<IssTelemetry> GetCurrentPositionAsync(CancellationToken cancellationToken = default)
    {
        var response = await ReadJsonAsync<IssPositionResponse>(
            IssPositionEndpoint,
            "ISS-Positionsdaten",
            cancellationToken);

        if (response.Position is null)
        {
            throw new InvalidOperationException("Die ISS-Positionsantwort enthielt keine Koordinaten.");
        }

        if (!double.TryParse(response.Position.Latitude, NumberStyles.Float, CultureInfo.InvariantCulture, out var latitude) ||
            !double.TryParse(response.Position.Longitude, NumberStyles.Float, CultureInfo.InvariantCulture, out var longitude))
        {
            throw new InvalidOperationException("Die ISS-Koordinaten konnten nicht gelesen werden.");
        }

        return new IssTelemetry(
            latitude,
            longitude,
            DateTimeOffset.FromUnixTimeSeconds(response.Timestamp),
            "Position wird bestimmt");
    }

    public async Task<AstronautManifest> GetAstronautsAsync(CancellationToken cancellationToken = default)
    {
        var response = await ReadJsonAsync<AstronautsResponse>(
            AstronautsEndpoint,
            "Astronauten-Daten",
            cancellationToken);

        var people = response.People
            .Where(person => !string.IsNullOrWhiteSpace(person.Name))
            .OrderBy(person => person.Craft, StringComparer.OrdinalIgnoreCase)
            .ThenBy(person => person.Name, StringComparer.OrdinalIgnoreCase)
            .ToList();

        return new AstronautManifest(response.Number > 0 ? response.Number : people.Count, people);
    }

    private async Task<T> ReadJsonAsync<T>(
        Uri endpoint,
        string sourceName,
        CancellationToken cancellationToken)
    {
        using var response = await _httpClient.GetAsync(endpoint, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            throw new HttpRequestException(
                $"{sourceName} konnte nicht geladen werden. Status: {(int)response.StatusCode} {response.ReasonPhrase}");
        }

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        var result = await JsonSerializer.DeserializeAsync<T>(stream, JsonOptions, cancellationToken);

        return result ?? throw new InvalidOperationException($"{sourceName} enthielt keine verwertbaren Daten.");
    }
}
