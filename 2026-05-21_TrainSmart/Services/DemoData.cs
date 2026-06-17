using TrainSmart.Models;

namespace TrainSmart.Services;

public static class DemoData
{
    public static StravaAthlete CreateAthlete() => new()
    {
        Id = 100200300,
        FirstName = "Mia",
        LastName = "Runner",
        City = "Wien",
        Country = "Austria"
    };

    public static IReadOnlyList<StravaActivity> CreateActivities()
    {
        var today = DateTime.Today;
        return
        [
            Run(1, "Donaukanal Tempo", today.AddDays(-1), 8.2, 2310, 42, 158, 2, 3),
            Run(2, "Easy Run Prater", today.AddDays(-3), 6.1, 2140, 18, 143, 0, 1),
            Run(3, "Hill Repeats", today.AddDays(-5), 10.4, 3340, 205, 162, 1, 4),
            Run(4, "Recovery Jog", today.AddDays(-8), 5.0, 1810, 12, 137, 0, 0),
            Run(5, "Long Run Sunday", today.AddDays(-10), 18.6, 6530, 166, 151, 3, 6),
            Run(6, "Track Intervals", today.AddDays(-13), 7.5, 2420, 22, 166, 1, 2),
            Run(7, "Morning Loop", today.AddDays(-16), 9.8, 3240, 88, 149, 0, 1),
            Run(8, "City Night Run", today.AddDays(-20), 11.2, 3660, 58, 155, 2, 5),
            Run(9, "Steady Progression", today.AddDays(-24), 12.0, 3860, 72, 153, 1, 2),
            Run(10, "Short Shakeout", today.AddDays(-27), 4.4, 1490, 8, 132, 0, 0),
            Ride(11, "Bike Commute", today.AddDays(-29), 13.1, 2320, 64, 126),
            Run(12, "Park Run", today.AddDays(-32), 5.0, 1580, 17, 159, 2, 3)
        ];
    }

    private static StravaActivity Run(
        long id,
        string name,
        DateTime date,
        double kilometers,
        int movingSeconds,
        double elevation,
        double heartRate,
        int prs,
        int achievements)
    {
        return new StravaActivity
        {
            Id = id,
            Name = name,
            Type = "Run",
            SportType = "Run",
            StartDateLocal = date.AddHours(7).AddMinutes(id % 6 * 8),
            DistanceMeters = kilometers * 1000,
            MovingTimeSeconds = movingSeconds,
            ElapsedTimeSeconds = movingSeconds + 90,
            TotalElevationGain = elevation,
            AverageSpeedMetersPerSecond = kilometers * 1000 / movingSeconds,
            MaxSpeedMetersPerSecond = kilometers * 1000 / movingSeconds * 1.45,
            AverageHeartRate = heartRate,
            MaxHeartRate = heartRate + 22,
            PrCount = prs,
            AchievementCount = achievements,
            KudosCount = achievements + 4
        };
    }

    private static StravaActivity Ride(long id, string name, DateTime date, double kilometers, int movingSeconds, double elevation, double heartRate)
    {
        return new StravaActivity
        {
            Id = id,
            Name = name,
            Type = "Ride",
            SportType = "Ride",
            StartDateLocal = date.AddHours(16),
            DistanceMeters = kilometers * 1000,
            MovingTimeSeconds = movingSeconds,
            ElapsedTimeSeconds = movingSeconds + 120,
            TotalElevationGain = elevation,
            AverageSpeedMetersPerSecond = kilometers * 1000 / movingSeconds,
            MaxSpeedMetersPerSecond = kilometers * 1000 / movingSeconds * 1.35,
            AverageHeartRate = heartRate,
            MaxHeartRate = heartRate + 18,
            KudosCount = 7
        };
    }
}
