import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { fetchAlerts } from '../services/api';

// Show notifications in the foreground as well
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const POLL_INTERVAL_MS = 30_000; // 30 seconds

/**
 * Requests notification permission on mount, then polls for unresolved alerts
 * every 30 seconds. Fires a local notification for any alert_id not yet seen.
 */
export function useAlertNotifications(userId) {
  // Keep track of alert_ids we've already notified about (persists across polls)
  const seenIds = useRef(new Set());
  const permitted = useRef(false);

  // Request permission once
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      permitted.current = status === 'granted';
    })();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const poll = async () => {
      if (!permitted.current) return;
      const alerts = await fetchAlerts(false, userId); // unresolved only
      for (const alert of alerts) {
        if (!seenIds.current.has(alert.alert_id)) {
          seenIds.current.add(alert.alert_id);
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `⚠️ ${alert.title}`,
              body: alert.details || 'New critical alert from your device.',
              data: { alert_id: alert.alert_id },
            },
            trigger: null, // fire immediately
          });
        }
      }
    };

    // Run immediately on mount, then on interval
    poll();
    const timer = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [userId]);
}
