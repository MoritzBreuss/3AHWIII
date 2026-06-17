using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.AspNetCore.WebUtilities;
using TrainSmart.Models;

namespace TrainSmart.Services;

public sealed class StravaApiClient(HttpClient httpClient)
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public string CreateAuthorizationUrl(string clientId, string redirectUri)
    {
        var query = new Dictionary<string, string?>
        {
            ["client_id"] = clientId,
            ["redirect_uri"] = redirectUri,
            ["response_type"] = "code",
            ["approval_prompt"] = "force",
            ["scope"] = "read,activity:read_all,profile:read_all"
        };

        return QueryHelpers.AddQueryString("https://www.strava.com/oauth/authorize", query);
    }

    public Task<StravaTokenResponse> ExchangeCodeAsync(
        string clientId,
        string clientSecret,
        string code,
        CancellationToken cancellationToken = default)
    {
        var values = new Dictionary<string, string>
        {
            ["client_id"] = clientId,
            ["client_secret"] = clientSecret,
            ["code"] = code,
            ["grant_type"] = "authorization_code"
        };

        return SendTokenRequestAsync(values, cancellationToken);
    }

    public Task<StravaTokenResponse> RefreshTokenAsync(
        string clientId,
        string clientSecret,
        string refreshToken,
        CancellationToken cancellationToken = default)
    {
        var values = new Dictionary<string, string>
        {
            ["client_id"] = clientId,
            ["client_secret"] = clientSecret,
            ["refresh_token"] = refreshToken,
            ["grant_type"] = "refresh_token"
        };

        return SendTokenRequestAsync(values, cancellationToken);
    }

    public async Task<StravaAthlete> GetAthleteAsync(string accessToken, CancellationToken cancellationToken = default)
    {
        using var request = CreateAuthorizedRequest(HttpMethod.Get, "https://www.strava.com/api/v3/athlete", accessToken);
        using var response = await httpClient.SendAsync(request, cancellationToken);
        return await ReadJsonOrThrowAsync<StravaAthlete>(response, cancellationToken);
    }

    public async Task<IReadOnlyList<StravaActivity>> GetActivitiesAsync(
        string accessToken,
        int page = 1,
        int perPage = 60,
        CancellationToken cancellationToken = default)
    {
        var url = QueryHelpers.AddQueryString("https://www.strava.com/api/v3/athlete/activities", new Dictionary<string, string?>
        {
            ["page"] = page.ToString(),
            ["per_page"] = Math.Clamp(perPage, 1, 100).ToString()
        });

        using var request = CreateAuthorizedRequest(HttpMethod.Get, url, accessToken);
        using var response = await httpClient.SendAsync(request, cancellationToken);
        return await ReadJsonOrThrowAsync<List<StravaActivity>>(response, cancellationToken);
    }

    public async Task RefreshDashboardAsync(StravaConnectionState state, CancellationToken cancellationToken = default)
    {
        if (!state.IsConnected || string.IsNullOrWhiteSpace(state.AccessToken))
        {
            throw new InvalidOperationException("Bitte zuerst mit Strava verbinden.");
        }

        if (state.TokenExpiresAt <= DateTimeOffset.UtcNow.AddMinutes(2))
        {
            if (!state.CanRefresh)
            {
                throw new InvalidOperationException("Der Access Token ist abgelaufen. Bitte im Login erneut verbinden.");
            }

            var refreshedToken = await RefreshTokenAsync(
                state.ClientId!,
                state.ClientSecret!,
                state.RefreshToken!,
                cancellationToken);
            state.ApplyToken(refreshedToken);
        }

        var athlete = state.Athlete ?? await GetAthleteAsync(state.AccessToken!, cancellationToken);
        var activities = await GetActivitiesAsync(state.AccessToken!, cancellationToken: cancellationToken);
        state.SetDashboardData(athlete, activities, isDemoMode: false);
    }

    private async Task<StravaTokenResponse> SendTokenRequestAsync(
        Dictionary<string, string> values,
        CancellationToken cancellationToken)
    {
        using var content = new FormUrlEncodedContent(values);
        using var response = await httpClient.PostAsync("https://www.strava.com/oauth/token", content, cancellationToken);
        return await ReadJsonOrThrowAsync<StravaTokenResponse>(response, cancellationToken);
    }

    private static HttpRequestMessage CreateAuthorizedRequest(HttpMethod method, string url, string accessToken)
    {
        var request = new HttpRequestMessage(method, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        return request;
    }

    private static async Task<T> ReadJsonOrThrowAsync<T>(HttpResponseMessage response, CancellationToken cancellationToken)
    {
        var body = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var detail = string.IsNullOrWhiteSpace(body) ? response.ReasonPhrase : body;
            throw new InvalidOperationException($"Strava API Fehler {(int)response.StatusCode}: {detail}");
        }

        return JsonSerializer.Deserialize<T>(body, JsonOptions)
            ?? throw new InvalidOperationException("Die Strava-Antwort konnte nicht gelesen werden.");
    }
}
