using TrainSmart.Models;

namespace TrainSmart.Services;

public sealed class StravaConnectionState
{
    public string? ClientId { get; private set; }

    public string? ClientSecret { get; private set; }

    public string? AccessToken { get; private set; }

    public string? RefreshToken { get; private set; }

    public DateTimeOffset TokenExpiresAt { get; private set; }

    public string? Scope { get; private set; }

    public StravaAthlete? Athlete { get; private set; }

    public IReadOnlyList<StravaActivity> Activities { get; private set; } = [];

    public bool IsDemoMode { get; private set; }

    public bool IsConnected => !string.IsNullOrWhiteSpace(AccessToken) || Athlete is not null || Activities.Count > 0 || IsDemoMode;

    public bool HasActivities => Activities.Count > 0;

    public bool CanRefresh =>
        !string.IsNullOrWhiteSpace(ClientId)
        && !string.IsNullOrWhiteSpace(ClientSecret)
        && !string.IsNullOrWhiteSpace(RefreshToken);

    public void ConfigureCredentials(string clientId, string clientSecret)
    {
        ClientId = clientId.Trim();
        ClientSecret = clientSecret.Trim();
        IsDemoMode = false;
    }

    public void ApplyToken(StravaTokenResponse token)
    {
        AccessToken = token.AccessToken;
        RefreshToken = token.RefreshToken;
        TokenExpiresAt = token.ExpiresAt;
        Scope = token.Scope;

        if (token.Athlete is not null)
        {
            Athlete = token.Athlete;
        }
    }

    public void SetDashboardData(StravaAthlete athlete, IReadOnlyList<StravaActivity> activities, bool isDemoMode)
    {
        Athlete = athlete;
        Activities = activities
            .OrderByDescending(activity => activity.StartDateLocal)
            .ToList();
        IsDemoMode = isDemoMode;
    }

    public void LoadDemoData()
    {
        ClearSecrets();
        SetDashboardData(DemoData.CreateAthlete(), DemoData.CreateActivities(), isDemoMode: true);
    }

    public void Disconnect()
    {
        ClearSecrets();
        Athlete = null;
        Activities = [];
        IsDemoMode = false;
    }

    private void ClearSecrets()
    {
        ClientId = null;
        ClientSecret = null;
        AccessToken = null;
        RefreshToken = null;
        Scope = null;
        TokenExpiresAt = default;
    }
}
