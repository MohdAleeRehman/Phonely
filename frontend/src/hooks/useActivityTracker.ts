import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
const THROTTLE_TIME = 30000; // Update activity every 30 seconds at most

export function useActivityTracker() {
  const { isAuthenticated, updateActivity } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    let lastUpdate = Date.now();

    const handleActivity = () => {
      const now = Date.now();
      // Only update if 30 seconds have passed since last update
      if (now - lastUpdate >= THROTTLE_TIME) {
        updateActivity();
        lastUpdate = now;
      }
    };

    // Add listeners for all activity events
    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Cleanup
    return () => {
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isAuthenticated, updateActivity]);
}
