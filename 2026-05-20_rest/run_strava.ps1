# run_strava.ps1
# Automates Strava OAuth code-exchange, updates apis.rest, refreshes token and calls API endpoints.

# ACHTUNG: Keine echten Secrets committen. Werte aus Umgebungsvariablen lesen
# oder vor dem Ausfuehren lokal eintragen (https://www.strava.com/settings/api).
$clientId = if ($env:STRAVA_CLIENT_ID) { $env:STRAVA_CLIENT_ID } else { 'YOUR_CLIENT_ID' }
$clientSecret = if ($env:STRAVA_CLIENT_SECRET) { $env:STRAVA_CLIENT_SECRET } else { 'YOUR_CLIENT_SECRET' }
$redirectUri = 'http://localhost/exchange_token'
$apisPath = Join-Path $PSScriptRoot 'apis.rest'

function Prompt-Authorize {
    $authorizeUrl = "https://www.strava.com/oauth/authorize?client_id=$clientId&response_type=code&redirect_uri=$redirectUri&approval_prompt=force&scope=read,activity:read,activity:write,profile:read_all"
    Write-Output "Open this URL in your browser and grant access:`n$authorizeUrl"
    Start-Process $authorizeUrl
    $code = Read-Host "After approval, paste the 'code' parameter from the redirect URL"
    return $code
}

function Exchange-CodeForTokens($code) {
    $body = "client_id=$clientId&client_secret=$clientSecret&code=$code&grant_type=authorization_code&redirect_uri=$redirectUri"
    try {
        $resp = Invoke-RestMethod -Method Post -Uri 'https://www.strava.com/oauth/token' -ContentType 'application/x-www-form-urlencoded' -Body $body
        return $resp
    } catch {
        Write-Error "Token exchange failed: $_"
        return $null
    }
}

function Update-RefreshTokenInApis($newRefreshToken) {
    if (-not (Test-Path $apisPath)) { Write-Warning "apis.rest not found at $apisPath"; return }
    $contents = Get-Content $apisPath -Raw
    if ($contents -match '@refreshToken\s*=\s*.*') {
        $new = $contents -replace '(@refreshToken\s*=\s*).*', "`$1$newRefreshToken"
    } else {
        # Append if missing
        $new = $contents + "`n@refreshToken = $newRefreshToken`n"
    }
    Set-Content -Path $apisPath -Value $new
    Write-Output "Updated @refreshToken in $apisPath"
}

function Refresh-AccessToken($refreshToken) {
    $body = "client_id=$clientId&client_secret=$clientSecret&grant_type=refresh_token&refresh_token=$refreshToken"
    try {
        $resp = Invoke-RestMethod -Method Post -Uri 'https://www.strava.com/oauth/token' -ContentType 'application/x-www-form-urlencoded' -Body $body
        return $resp
    } catch {
        Write-Error "Refresh failed: $_"
        return $null
    }
}

function Call-ApiExamples($accessToken) {
    $headers = @{ Authorization = "Bearer $accessToken" }
    try {
        $athlete = Invoke-RestMethod -Method Get -Uri 'https://www.strava.com/api/v3/athlete' -Headers $headers
        Write-Output "Athlete: $($athlete.id) - $($athlete.firstname) $($athlete.lastname)"
    } catch { Write-Warning "Athlete call failed: $_" }
    try {
        $activities = Invoke-RestMethod -Method Get -Uri 'https://www.strava.com/api/v3/athlete/activities?per_page=5&page=1' -Headers $headers
        Write-Output "Activities returned: $($activities.Count)"
    } catch { Write-Warning "List activities failed: $_" }
    try {
        $createBody = "name=Morning Run&sport_type=Run&start_date_local=2026-05-20T07:00:00Z&elapsed_time=3600&description=A nice morning run around the park.&distance=10000&trainer=0&commute=0"
        $created = Invoke-RestMethod -Method Post -Uri 'https://www.strava.com/api/v3/activities' -Headers $headers -ContentType 'application/x-www-form-urlencoded' -Body $createBody
        if ($created -and $created.id) { Write-Output "Created activity id: $($created.id) name: $($created.name)" } else { Write-Warning "Create activity returned no id" }
    } catch { Write-Warning "Create activity failed: $_" }
}

# --- Main flow ---
$code = Prompt-Authorize
if (-not $code) { Write-Error 'No code provided. Exiting.'; exit 1 }
$exchange = Exchange-CodeForTokens $code
if (-not $exchange) { Write-Error 'Exchange failed. Exiting.'; exit 1 }
Write-Output "Access token expires at: $($exchange.expires_at)"
Write-Output "Scopes: $($exchange.scope -join ',')"

# Update refresh token in apis.rest
if ($exchange.refresh_token) { Update-RefreshTokenInApis $exchange.refresh_token }

# Refresh to obtain a long-lived access token
$refreshResp = Refresh-AccessToken $exchange.refresh_token
if (-not $refreshResp) { Write-Error 'Could not refresh token. Exiting.'; exit 1 }
$accessToken = $refreshResp.access_token
Write-Output "Using access token (expires_at=$($refreshResp.expires_at))"

# Call API examples
Call-ApiExamples $accessToken

Write-Output 'Done.'
