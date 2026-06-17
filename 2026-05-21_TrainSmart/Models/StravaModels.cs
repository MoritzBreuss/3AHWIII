using System.Text.Json.Serialization;

namespace TrainSmart.Models;

public sealed class StravaAthlete
{
    [JsonPropertyName("id")]
    public long Id { get; set; }

    [JsonPropertyName("firstname")]
    public string FirstName { get; set; } = string.Empty;

    [JsonPropertyName("lastname")]
    public string LastName { get; set; } = string.Empty;

    [JsonPropertyName("city")]
    public string? City { get; set; }

    [JsonPropertyName("country")]
    public string? Country { get; set; }

    [JsonPropertyName("profile")]
    public string? ProfileImageUrl { get; set; }

    [JsonIgnore]
    public string DisplayName
    {
        get
        {
            var name = $"{FirstName} {LastName}".Trim();
            return string.IsNullOrWhiteSpace(name) ? "Strava Athlete" : name;
        }
    }
}

public sealed class StravaActivity
{
    [JsonPropertyName("id")]
    public long Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("type")]
    public string Type { get; set; } = string.Empty;

    [JsonPropertyName("sport_type")]
    public string SportType { get; set; } = string.Empty;

    [JsonPropertyName("start_date_local")]
    public DateTime StartDateLocal { get; set; }

    [JsonPropertyName("distance")]
    public double DistanceMeters { get; set; }

    [JsonPropertyName("moving_time")]
    public int MovingTimeSeconds { get; set; }

    [JsonPropertyName("elapsed_time")]
    public int ElapsedTimeSeconds { get; set; }

    [JsonPropertyName("total_elevation_gain")]
    public double TotalElevationGain { get; set; }

    [JsonPropertyName("average_speed")]
    public double AverageSpeedMetersPerSecond { get; set; }

    [JsonPropertyName("max_speed")]
    public double MaxSpeedMetersPerSecond { get; set; }

    [JsonPropertyName("average_heartrate")]
    public double? AverageHeartRate { get; set; }

    [JsonPropertyName("max_heartrate")]
    public double? MaxHeartRate { get; set; }

    [JsonPropertyName("achievement_count")]
    public int AchievementCount { get; set; }

    [JsonPropertyName("pr_count")]
    public int PrCount { get; set; }

    [JsonPropertyName("kudos_count")]
    public int KudosCount { get; set; }

    [JsonIgnore]
    public double DistanceKilometers => DistanceMeters / 1000d;

    [JsonIgnore]
    public string DisplayType => string.IsNullOrWhiteSpace(SportType) ? Type : SportType;

    [JsonIgnore]
    public bool IsRun => DisplayType.Contains("Run", StringComparison.OrdinalIgnoreCase);
}

public sealed class StravaTokenResponse
{
    [JsonPropertyName("access_token")]
    public string AccessToken { get; set; } = string.Empty;

    [JsonPropertyName("refresh_token")]
    public string RefreshToken { get; set; } = string.Empty;

    [JsonPropertyName("expires_at")]
    public long ExpiresAtUnix { get; set; }

    [JsonPropertyName("expires_in")]
    public int ExpiresInSeconds { get; set; }

    [JsonPropertyName("scope")]
    public string? Scope { get; set; }

    [JsonPropertyName("athlete")]
    public StravaAthlete? Athlete { get; set; }

    [JsonIgnore]
    public DateTimeOffset ExpiresAt => DateTimeOffset.FromUnixTimeSeconds(ExpiresAtUnix);
}
