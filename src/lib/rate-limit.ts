/**
 * Simple in-memory rate limiter for API routes and server actions.
 * Uses a sliding window approach with automatic cleanup.
 */

type RateLimitEntry = {
    count: number;
    resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

// Cleanup expired entries every 60 seconds
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

function ensureCleanup() {
    if (cleanupInterval) return;
    cleanupInterval = setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of store) {
            if (now > entry.resetAt) {
                store.delete(key);
            }
        }
    }, 60_000);
    // Allow the process to exit without waiting for the interval
    if (cleanupInterval.unref) cleanupInterval.unref();
}

type RateLimitConfig = {
    /** Unique identifier for this limiter (e.g., 'webchat', 'register') */
    prefix: string;
    /** Maximum number of requests in the window */
    limit: number;
    /** Window duration in seconds */
    windowSeconds: number;
};

type RateLimitResult = {
    success: boolean;
    limit: number;
    remaining: number;
    resetAt: number;
};

/**
 * Check rate limit for a given key (usually IP address).
 * Returns { success: true } if within limits, { success: false } if exceeded.
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
    ensureCleanup();

    const storeKey = `${config.prefix}:${key}`;
    const now = Date.now();
    const entry = store.get(storeKey);

    if (!entry || now > entry.resetAt) {
        // New window
        const resetAt = now + config.windowSeconds * 1000;
        store.set(storeKey, { count: 1, resetAt });
        return { success: true, limit: config.limit, remaining: config.limit - 1, resetAt };
    }

    entry.count++;

    if (entry.count > config.limit) {
        return { success: false, limit: config.limit, remaining: 0, resetAt: entry.resetAt };
    }

    return { success: true, limit: config.limit, remaining: config.limit - entry.count, resetAt: entry.resetAt };
}

/**
 * Extract client IP from request headers (works behind proxies).
 */
export function getClientIp(req: Request): string {
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    const realIp = req.headers.get('x-real-ip');
    if (realIp) return realIp;
    return '127.0.0.1';
}

/**
 * Convenience: check rate limit and return a 429 response if exceeded.
 * Returns null if within limits, or a NextResponse with 429 status.
 */
export function rateLimitResponse(req: Request, config: RateLimitConfig): Response | null {
    const ip = getClientIp(req);
    const result = checkRateLimit(ip, config);

    if (!result.success) {
        return new Response(
            JSON.stringify({ error: 'Too many requests. Please try again later.' }),
            {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)),
                    'X-RateLimit-Limit': String(result.limit),
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
                },
            }
        );
    }

    return null;
}
