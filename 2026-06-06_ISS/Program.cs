using IssTracker.Components;
using IssTracker.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

builder.Services.AddHttpClient(IssApiService.HttpClientName, client =>
{
    client.Timeout = TimeSpan.FromSeconds(10);
    client.DefaultRequestHeaders.UserAgent.ParseAdd("IssTracker/1.0");
});

builder.Services.AddScoped<IIssApiService, IssApiService>();
builder.Services.AddScoped<IReverseGeocodingService, BrowserReverseGeocodingService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();


app.UseAntiforgery();

app.MapGet("/runtime/leaflet.js", async (IWebHostEnvironment environment, CancellationToken cancellationToken) =>
{
    var path = Path.Combine(environment.WebRootPath, "lib", "leaflet", "leaflet.js");
    var script = await File.ReadAllTextAsync(path, cancellationToken);

    return Results.Text(script, "text/javascript");
});

app.MapGet("/runtime/issMap.js", async (IWebHostEnvironment environment, CancellationToken cancellationToken) =>
{
    var path = Path.Combine(environment.WebRootPath, "js", "issMap.js");
    var script = await File.ReadAllTextAsync(path, cancellationToken);

    return Results.Text(script, "text/javascript");
});

app.MapGet("/runtime/bootstrap.css", async (IWebHostEnvironment environment, CancellationToken cancellationToken) =>
{
    var path = Path.Combine(environment.WebRootPath, "lib", "bootstrap", "dist", "css", "bootstrap.min.css");
    var stylesheet = await File.ReadAllTextAsync(path, cancellationToken);

    return Results.Text(stylesheet, "text/css");
});

app.MapGet("/runtime/leaflet.css", async (IWebHostEnvironment environment, CancellationToken cancellationToken) =>
{
    var path = Path.Combine(environment.WebRootPath, "lib", "leaflet", "leaflet.css");
    var stylesheet = await File.ReadAllTextAsync(path, cancellationToken);

    return Results.Text(stylesheet, "text/css");
});

app.MapGet("/runtime/app.css", async (IWebHostEnvironment environment, CancellationToken cancellationToken) =>
{
    var path = Path.Combine(environment.WebRootPath, "app.css");
    var stylesheet = await File.ReadAllTextAsync(path, cancellationToken);

    return Results.Text(stylesheet, "text/css");
});

app.MapStaticAssets();
app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode();

app.Run();
