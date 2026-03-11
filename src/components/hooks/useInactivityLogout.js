import { useCallback, useEffect, useRef } from "react";

/* ==============================
Hook: useInactivityLogout
============================== */

export default function useInactivityLogout({
    enabled = true,
    timeoutMs = 15 * 60 * 1000,
    warningMs = 0,
    onWarning,
    onTimeout,
}) {
    /* ==============================
    Refs
    ============================== */
    const timeoutRef = useRef(null);
    const warningRef = useRef(null);

    const onWarningRef = useRef(onWarning);
    const onTimeoutRef = useRef(onTimeout);

    /* ==============================
    Sync callbacks
    ============================== */
    useEffect(() => {
        onWarningRef.current = onWarning;
    }, [onWarning]);

    useEffect(() => {
        onTimeoutRef.current = onTimeout;
    }, [onTimeout]);

    /* ==============================
    Helpers
    ============================== */
    const clearTimers = useCallback(() => {
        if (warningRef.current) {
            clearTimeout(warningRef.current);
            warningRef.current = null;
        }

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    const startTimers = useCallback(() => {
        clearTimers();

        if (!enabled) return;
        if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) return;

        const safeWarningMs =
            Number.isFinite(warningMs) && warningMs > 0 && warningMs < timeoutMs
                ? warningMs
                : 0;

        if (safeWarningMs > 0) {
            warningRef.current = setTimeout(() => {
                onWarningRef.current?.();
            }, timeoutMs - safeWarningMs);
        }

        timeoutRef.current = setTimeout(() => {
            onTimeoutRef.current?.();
        }, timeoutMs);
    }, [clearTimers, enabled, timeoutMs, warningMs]);

    const resetTimer = useCallback(() => {
        startTimers();
    }, [startTimers]);

    /* ==============================
    Activity listeners
    ============================== */
    useEffect(() => {
        if (!enabled) {
            clearTimers();
            return;
        }

        const events = [
            "mousemove",
            "mousedown",
            "click",
            "scroll",
            "keydown",
            "touchstart",
        ];

        const handleActivity = () => {
            resetTimer();
        };

        events.forEach((eventName) => {
            window.addEventListener(eventName, handleActivity, { passive: true });
        });

        startTimers();

        return () => {
            events.forEach((eventName) => {
                window.removeEventListener(eventName, handleActivity);
            });

            clearTimers();
        };
    }, [enabled, clearTimers, resetTimer, startTimers]);

    /* ==============================
    API
    ============================== */
    return {
        resetTimer,
        clearTimers,
    };
}