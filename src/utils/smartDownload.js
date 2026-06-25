/**
 * Smart Download Manager
 * Handles intelligent model downloading based on device conditions
 */

// Download conditions
export const DOWNLOAD_CONDITIONS = {
    OPTIMAL: 'optimal',      // WiFi + Charging + High battery
    GOOD: 'good',            // WiFi + Medium battery
    METERED: 'metered',      // Mobile data - ask user
    BATTERY_LOW: 'battery_low', // < 30% battery
    OFFLINE: 'offline'       // No connection
};

/**
 * Check current download conditions
 */
export async function checkDownloadConditions() {
    const result = {
        condition: DOWNLOAD_CONDITIONS.OPTIMAL,
        isWifi: true,
        isMetered: false,
        isCharging: false,
        batteryLevel: 1,
        effectiveType: '4g',
        shouldAutoDownload: true,
        reason: ''
    };

    // Network Information API
    if ('connection' in navigator) {
        const conn = navigator.connection;
        result.effectiveType = conn.effectiveType || '4g';
        result.isMetered = conn.saveData || false;

        // Check if on cellular
        if (conn.type === 'cellular' || conn.type === 'bluetooth') {
            result.isWifi = false;
            result.isMetered = true;
        }

        // Slow connection
        if (conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g') {
            result.shouldAutoDownload = false;
            result.condition = DOWNLOAD_CONDITIONS.METERED;
            result.reason = 'Slow connection detected';
        }
    }

    // Battery API
    if ('getBattery' in navigator) {
        try {
            const battery = await navigator.getBattery();
            result.batteryLevel = battery.level;
            result.isCharging = battery.charging;

            if (battery.level < 0.3 && !battery.charging) {
                result.shouldAutoDownload = false;
                result.condition = DOWNLOAD_CONDITIONS.BATTERY_LOW;
                result.reason = 'Battery below 30%';
            }
        } catch (e) {
            console.log('Battery API not available');
        }
    }

    // Offline check
    if (!navigator.onLine) {
        result.shouldAutoDownload = false;
        result.condition = DOWNLOAD_CONDITIONS.OFFLINE;
        result.reason = 'No internet connection';
    }

    // Metered connection (mobile data)
    if (result.isMetered && result.condition !== DOWNLOAD_CONDITIONS.BATTERY_LOW) {
        result.shouldAutoDownload = false;
        result.condition = DOWNLOAD_CONDITIONS.METERED;
        result.reason = 'Mobile data detected - download may use quota';
    }

    // Optimal conditions
    if (result.isWifi && result.isCharging && result.batteryLevel > 0.5) {
        result.condition = DOWNLOAD_CONDITIONS.OPTIMAL;
        result.shouldAutoDownload = true;
        result.reason = 'Optimal conditions - WiFi + Charging';
    } else if (result.isWifi && result.batteryLevel > 0.3) {
        result.condition = DOWNLOAD_CONDITIONS.GOOD;
        result.shouldAutoDownload = true;
        result.reason = 'Good conditions - WiFi available';
    }

    return result;
}

/**
 * Download with idle callback - downloads during browser idle time
 */
export function downloadDuringIdle(downloadFn, options = {}) {
    const { onProgress, onComplete, onPause } = options;
    let isPaused = false;
    let isComplete = false;

    const scheduleChunk = () => {
        if (isPaused || isComplete) return;

        if ('requestIdleCallback' in window) {
            requestIdleCallback((deadline) => {
                // Only work if we have idle time
                if (deadline.timeRemaining() > 10 || deadline.didTimeout) {
                    downloadFn()
                        .then((done) => {
                            if (done) {
                                isComplete = true;
                                onComplete?.();
                            } else {
                                onProgress?.();
                                scheduleChunk();
                            }
                        })
                        .catch(() => {
                            // Retry after delay
                            setTimeout(scheduleChunk, 5000);
                        });
                } else {
                    // No idle time, try again soon
                    setTimeout(scheduleChunk, 1000);
                }
            }, { timeout: 30000 });
        } else {
            // Fallback for browsers without requestIdleCallback
            downloadFn()
                .then((done) => {
                    if (done) {
                        isComplete = true;
                        onComplete?.();
                    } else {
                        onProgress?.();
                        setTimeout(scheduleChunk, 100);
                    }
                });
        }
    };

    // Start download
    scheduleChunk();

    // Return control functions
    return {
        pause: () => {
            isPaused = true;
            onPause?.();
        },
        resume: () => {
            isPaused = false;
            scheduleChunk();
        },
        isPaused: () => isPaused,
        isComplete: () => isComplete
    };
}

/**
 * Watch for condition changes
 */
export function watchDownloadConditions(callback) {
    // Network change
    if ('connection' in navigator) {
        navigator.connection.addEventListener('change', async () => {
            callback(await checkDownloadConditions());
        });
    }

    // Online/offline
    window.addEventListener('online', async () => callback(await checkDownloadConditions()));
    window.addEventListener('offline', async () => callback(await checkDownloadConditions()));

    // Battery change
    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            battery.addEventListener('chargingchange', async () => callback(await checkDownloadConditions()));
            battery.addEventListener('levelchange', async () => callback(await checkDownloadConditions()));
        });
    }
}

/**
 * Get human-readable size
 */
export function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}
