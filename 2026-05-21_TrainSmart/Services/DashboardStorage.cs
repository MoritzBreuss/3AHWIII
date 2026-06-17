using System.Text.Json;
using Microsoft.JSInterop;
using TrainSmart.Models;

namespace TrainSmart.Services;

public sealed class DashboardStorage(IJSRuntime jsRuntime)
{
    private const string StorageKey = "trainsmart.dashboard.v1";
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public async ValueTask SaveAsync(StravaConnectionState state)
    {
        if (state.Athlete is null || state.Activities.Count == 0)
        {
            await ClearAsync();
            return;
        }

        var snapshot = new DashboardSnapshot(state.Athlete, state.Activities, state.IsDemoMode);
        var json = JsonSerializer.Serialize(snapshot, JsonOptions);
        await jsRuntime.InvokeVoidAsync("sessionStorage.setItem", StorageKey, json);
    }

    public async ValueTask<bool> TryLoadAsync(StravaConnectionState state)
    {
        if (state.IsConnected)
        {
            return true;
        }

        var json = await jsRuntime.InvokeAsync<string?>("sessionStorage.getItem", StorageKey);
        if (string.IsNullOrWhiteSpace(json))
        {
            return false;
        }

        var snapshot = JsonSerializer.Deserialize<DashboardSnapshot>(json, JsonOptions);
        if (snapshot?.Athlete is null || snapshot.Activities.Count == 0)
        {
            return false;
        }

        state.SetDashboardData(snapshot.Athlete, snapshot.Activities, snapshot.IsDemoMode);
        return true;
    }

    public ValueTask ClearAsync()
    {
        return jsRuntime.InvokeVoidAsync("sessionStorage.removeItem", StorageKey);
    }

    private sealed record DashboardSnapshot(
        StravaAthlete Athlete,
        IReadOnlyList<StravaActivity> Activities,
        bool IsDemoMode);
}
