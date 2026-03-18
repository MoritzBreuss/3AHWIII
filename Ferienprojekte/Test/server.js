const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');
const { GarminConnect } = require('garmin-connect');

const app = express();

function createGarminClient(email, password) {
    return new GarminConnect({
        username: email,
        password: password,
    });
}

function createGarminClientFromTokens(tokens) {
    // Constructor requires credentials but we won't use them — tokens override login
    const GCClient = new GarminConnect({ username: '_', password: '_' });
    GCClient.loadToken(tokens.oauth1, tokens.oauth2);
    return GCClient;
}

function toNumberOrNull(value) {
    if (value == null || value === '') return null;
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
}

function normalizeStrideLengthMeters(value) {
    const num = toNumberOrNull(value);
    if (num == null) return null;

    // Garmin payloads can vary by endpoint/device:
    // - meters (e.g., 0.87)
    // - centimeters (e.g., 87)
    // - millimeters (e.g., 870)
    if (num > 100) return num / 1000;
    if (num > 10) return num / 100;
    return num;
}

function toSeconds(value) {
    if (value == null || value === '') return 0;
    if (typeof value === 'string') {
        const v = value.trim();
        if (/^\d{1,2}:\d{2}(?::\d{2})?$/.test(v)) {
            const parts = v.split(':').map(Number);
            if (parts.length === 2) return (parts[0] * 60) + parts[1];
            if (parts.length === 3) return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
        }
    }

    const num = Number(value);
    if (!Number.isFinite(num)) return 0;

    // Garmin often returns milliseconds for zone durations.
    return num > 10000 ? Math.round(num / 1000) : Math.round(num);
}

function normalizeZoneArray(rawZones, fallbackPrefix) {
    if (!rawZones) return [];

    const list = Array.isArray(rawZones)
        ? rawZones
        : Object.entries(rawZones).map(([key, value]) => ({ key, ...(value || {}) }));

    const normalized = list.map((zone, idx) => {
        const zoneNumber =
            toNumberOrNull(zone.zoneNumber) ||
            toNumberOrNull(zone.zoneIndex) ||
            toNumberOrNull(zone.zone) ||
            toNumberOrNull(zone.order) ||
            toNumberOrNull(zone.key?.match(/\d+/)?.[0]) ||
            idx + 1;

        const fromValue =
            toNumberOrNull(zone.from) ??
            toNumberOrNull(zone.low) ??
            toNumberOrNull(zone.lowValue) ??
            toNumberOrNull(zone.min) ??
            toNumberOrNull(zone.start);

        const toValue =
            toNumberOrNull(zone.to) ??
            toNumberOrNull(zone.high) ??
            toNumberOrNull(zone.highValue) ??
            toNumberOrNull(zone.max) ??
            toNumberOrNull(zone.end);

        const seconds = toSeconds(
            zone.timeInSeconds ??
            zone.timeInZoneSeconds ??
            zone.seconds ??
            zone.duration ??
            zone.time ??
            zone.millis ??
            zone.ms
        );

        const percent =
            toNumberOrNull(zone.percent) ??
            toNumberOrNull(zone.percentage) ??
            toNumberOrNull(zone.pct);

        return {
            zone: zoneNumber,
            name: zone.name || zone.zoneName || `${fallbackPrefix} ${zoneNumber}`,
            from: fromValue,
            to: toValue,
            time_s: seconds,
            percent,
        };
    }).filter(z => z.time_s > 0 || z.percent != null || z.from != null || z.to != null);

    const totalSeconds = normalized.reduce((sum, z) => sum + (z.time_s || 0), 0);
    return normalized
        .sort((a, b) => a.zone - b.zone)
        .map(z => ({
            ...z,
            percent: z.percent != null
                ? Number(z.percent)
                : (totalSeconds > 0 ? Number(((z.time_s / totalSeconds) * 100).toFixed(1)) : null),
        }));
}

function firstNonEmptyZoneSource(sources) {
    for (const source of sources) {
        if (!source) continue;
        if (Array.isArray(source) && source.length) return source;
        if (!Array.isArray(source) && typeof source === 'object' && Object.keys(source).length) return source;
    }
    return null;
}

function extractZones(rawActivity, splits, details) {
    const hrSource = firstNonEmptyZoneSource([
        rawActivity?.heartRateDTO?.timeInHeartRateZones,
        rawActivity?.heartRateDTO?.heartRateZones,
        rawActivity?.heartRateZones,
        rawActivity?.timeInHeartRateZones,
        details?.heartRateDTO?.timeInHeartRateZones,
        details?.heartRateZones,
        details?.timeInHeartRateZones,
        splits?.heartRateDTO?.timeInHeartRateZones,
        splits?.heartRateZones,
    ]);

    const powerSource = firstNonEmptyZoneSource([
        rawActivity?.powerDTO?.timeInPowerZones,
        rawActivity?.powerDTO?.powerZones,
        rawActivity?.powerZones,
        rawActivity?.timeInPowerZones,
        details?.powerDTO?.timeInPowerZones,
        details?.powerZones,
        details?.timeInPowerZones,
        splits?.powerDTO?.timeInPowerZones,
        splits?.powerZones,
    ]);

    return {
        heartRateZones: normalizeZoneArray(hrSource, 'HR Zone'),
        powerZones: normalizeZoneArray(powerSource, 'Power Zone'),
    };
}

// ── Security middleware ──────────────────────
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            scriptSrcAttr: ["'none'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:"],
            connectSrc: ["'self'"],
        }
    }
}));
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    next();
});
app.use(cors({ origin: false })); // localhost only — no cross-origin
app.use(express.json({ limit: '2kb' })); // allow login payloads
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));
app.get('/', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
});

// Rate-limit API endpoints (max 10 requests per 15 min)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests. Please wait 15 minutes.' }
});

// Rate-limit login (max 5 per 15 min)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many login attempts. Please wait 15 minutes.' }
});

// ── Helper: extract Garmin tokens from request header ──
function getTokensFromHeader(req) {
    const raw = req.headers['x-garmin-tokens'];
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw);
        if (parsed.oauth1 && parsed.oauth2) return parsed;
        return null;
    } catch {
        return null;
    }
}

// ── POST /api/login ─ authenticate with Garmin, return tokens ──
app.post('/api/login', loginLimiter, async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }
    try {
        const GCClient = createGarminClient(email.trim(), password);
        await GCClient.login();

        // exportToken() returns { oauth1, oauth2 }
        const tokens = GCClient.exportToken();

        res.json({ success: true, tokens });
    } catch (error) {
        console.error('Login error:', error.message);
        const msg = error?.message || '';
        let userError = 'Login failed. Check your credentials and ensure MFA is disabled on Garmin Connect.';
        if (msg.includes('locked') || msg.includes('rate') || msg.includes('too many')) {
            userError = 'Account may be temporarily locked by Garmin. Wait a few minutes.';
        } else if (msg.includes('ECONNREFUSED') || msg.includes('ETIMEDOUT') || msg.includes('network')) {
            userError = 'Could not reach Garmin servers. Try again later.';
        }
        res.status(401).json({ success: false, error: userError });
    }
});

// Fetch all activities — filtering happens on the frontend
app.get('/api/activities', apiLimiter, async (req, res) => {
    const tokens = getTokensFromHeader(req);
    if (!tokens) {
        return res.status(401).json({ success: false, error: 'Not logged in. Please login first.' });
    }
    try {
        const GCClient = createGarminClientFromTokens(tokens);
        let activities;
        try {
            activities = await GCClient.getActivities(0, 200);
        } catch (tokenError) {
            return res.status(401).json({ success: false, error: 'Session expired. Please login again.' });
        }

        // Return all meaningful fields for every activity
        const data = activities.map(a => ({
            id: a.activityId,
            name: a.activityName,
            type: a.activityType?.typeKey || 'unknown',
            typeLabel: a.activityType?.typeKey?.replace(/_/g, ' ') || 'unknown',
            date: a.startTimeLocal,
            dateGMT: a.startTimeGMT,
            location: a.locationName || null,

            // Core
            distance_m: a.distance,
            duration_s: a.duration,
            elapsed_duration_s: a.elapsedDuration,
            moving_duration_s: a.movingDuration,
            calories: a.calories,
            steps: a.steps,

            // Speed / pace
            avg_speed_ms: a.averageSpeed,
            max_speed_ms: a.maxSpeed,

            // Heart rate
            avg_hr: a.averageHR,
            max_hr: a.maxHR,

            // Elevation
            elevation_gain: a.elevationGain,
            elevation_loss: a.elevationLoss,
            min_elevation: a.minElevation,
            max_elevation: a.maxElevation,

            // Cadence
            avg_running_cadence: a.averageRunningCadenceInStepsPerMinute,
            max_running_cadence: a.maxRunningCadenceInStepsPerMinute,
            avg_cycling_cadence: a.averageBikingCadenceInRevPerMinute,
            max_cycling_cadence: a.maxBikingCadenceInRevPerMinute,

            // Running dynamics
            avg_stride_length: normalizeStrideLengthMeters(a.avgStrideLength),
            avg_vertical_oscillation: a.avgVerticalOscillation,
            avg_ground_contact_time: a.avgGroundContactTime,
            avg_vertical_ratio: a.avgVerticalRatio,

            // Power
            avg_power: a.avgPower,
            max_power: a.maxPower,
            norm_power: a.normPower,

            // Training effect
            aerobic_te: a.aerobicTrainingEffect,
            anaerobic_te: a.anaerobicTrainingEffect,
            training_load: a.activityTrainingLoad,

            // Physiological
            vo2max: a.vO2MaxValue,

            // Respiration
            avg_respiration: a.avgRespirationRate,
            min_respiration: a.minRespirationRate,
            max_respiration: a.maxRespirationRate,

            // Temperature
            min_temp: a.minTemperature,
            max_temp: a.maxTemperature,

            // Stress
            avg_stress: a.avgStress,
            max_stress: a.maxStress,

            // Laps & device
            lap_count: a.lapCount,
            device: a.manufacturer,

            // Floors
            floors_climbed: a.floorsClimbed,
            floors_descended: a.floorsDescended,
        }));

        res.json({ success: true, activities: data });
    } catch (error) {
        console.error('Error:', error);

        // Determine a safe, user-facing message
        const msg = error?.message || 'Unknown error';
        let userError = msg;
        if (msg.includes('credentials') || msg.includes('password') || msg.includes('login')) {
            userError = 'Session expired. Please login again.';
        } else if (msg.includes('ECONNREFUSED') || msg.includes('ETIMEDOUT') || msg.includes('network')) {
            userError = 'Could not reach Garmin servers. Try again later.';
        } else if (msg.includes('locked') || msg.includes('rate') || msg.includes('too many')) {
            userError = 'Account may be temporarily locked by Garmin. Wait a few minutes.';
        }

        res.status(500).json({
            success: false,
            error: userError
        });
    }
});

// ── Fetch detailed split/lap data for one activity ──
app.get('/api/activity-details', apiLimiter, async (req, res) => {
    const tokens = getTokensFromHeader(req);
    if (!tokens) {
        return res.status(401).json({ success: false, error: 'Not logged in. Please login first.' });
    }
    const activityId = Number(req.query.id);

    if (!Number.isFinite(activityId) || activityId <= 0) {
        return res.status(400).json({ success: false, error: 'Valid query param id is required.' });
    }

    try {
        const GCClient = createGarminClientFromTokens(tokens);

        const baseUrl = 'https://connectapi.garmin.com/activity-service/activity/';

        // Fetch full activity, splits, and chart details in parallel
        const [activityData, splitsData, detailsData] = await Promise.allSettled([
            GCClient.getActivity({ activityId }),
            GCClient.get(baseUrl + activityId + '/splits'),
            GCClient.get(baseUrl + activityId + '/details', {
                params: { maxChartSize: 2000, maxPolylineSize: 2000 }
            })
        ]);

        const rawActivity = activityData.status === 'fulfilled' ? activityData.value : null;

        const splits = splitsData.status === 'fulfilled' ? splitsData.value : null;
        const details = detailsData.status === 'fulfilled' ? detailsData.value : null;
        const { heartRateZones, powerZones } = extractZones(rawActivity, splits, details);

        // Parse lap/split data into a clean array
        let laps = [];
        if (splits?.lapDTOs?.length) {
            laps = splits.lapDTOs.map((lap, i) => ({
                lap: i + 1,
                startTime: lap.startTimeGMT || null,
                duration_s: lap.duration,
                moving_duration_s: lap.movingDuration,
                distance_m: lap.distance,
                avg_speed_ms: lap.averageSpeed,
                max_speed_ms: lap.maxSpeed,
                avg_hr: lap.averageHR,
                max_hr: lap.maxHR,
                calories: lap.calories,
                avg_cadence: lap.averageRunCadence || lap.averageBikeCadence || null,
                max_cadence: lap.maxRunCadence || lap.maxBikeCadence || null,
                elevation_gain: lap.elevationGain,
                elevation_loss: lap.elevationLoss,
                avg_stride_length: normalizeStrideLengthMeters(lap.strideLength),
                avg_vertical_oscillation: lap.avgVerticalOscillation || null,
                avg_ground_contact_time: lap.groundContactTime || null,
                avg_power: lap.avgPower || null,
                max_power: lap.maxPower || null,
            }));
        } else if (splits?.splitSummaries?.length) {
            laps = splits.splitSummaries
                .filter(s => s.splitType === 'RWD_RUN' || s.splitType === 'INTERVAL' || s.splitType === 'LAP' || s.noOfSplits)
                .map((s, i) => ({
                    lap: i + 1,
                    startTime: null,
                    duration_s: s.duration,
                    moving_duration_s: s.movingDuration,
                    distance_m: s.distance,
                    avg_speed_ms: s.averageSpeed,
                    max_speed_ms: s.maxSpeed,
                    avg_hr: s.averageHR,
                    max_hr: s.maxHR,
                    calories: s.calories,
                    avg_cadence: s.averageRunCadence || null,
                    max_cadence: s.maxRunCadence || null,
                    elevation_gain: s.elevationGain,
                    elevation_loss: s.elevationLoss,
                    avg_stride_length: null,
                    avg_vertical_oscillation: null,
                    avg_ground_contact_time: null,
                    avg_power: null,
                    max_power: null,
                }));
        }

        // Parse chart/time-series metrics
        let metrics = [];
        if (details?.metricsDescriptors && details?.activityDetailMetrics) {
            // metricsDescriptors is an array of { metricsIndex, key }
            const keyMap = {};
            details.metricsDescriptors.forEach(d => { keyMap[d.metricsIndex] = d.key; });

            metrics = details.activityDetailMetrics.map(point => {
                const row = {};
                point.metrics.forEach((val, idx) => {
                    const key = keyMap[idx];
                    if (key) row[key] = val;
                });
                return row;
            });
        }

        res.json({
            success: true,
            laps,
            metrics,             // time-series points
            heartRateZones,
            powerZones,
            rawActivity,         // full activity object from Garmin
            rawSplits: splits,   // full splits response
            rawDetails: details, // full details response (charts, polyline)
        });
    } catch (error) {
        console.error('Detail error:', error);
        res.status(500).json({
            success: false,
            error: error?.message || 'Failed to fetch activity details.'
        });
    }
});

// Catch-all: return JSON 404 for unknown API routes (prevents HTML responses)
app.use('/api', (req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint not found.' });
});

// Global error handler — always return JSON, never HTML
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ success: false, error: 'Internal server error.' });
});

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});