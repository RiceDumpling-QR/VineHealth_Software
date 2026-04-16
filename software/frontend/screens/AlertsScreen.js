import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { fetchAlerts, resolveAlert, fetchUserDevices } from '../services/api';

const COLORS = {
  darkGreen: '#3a6b35',
  white: '#ffffff',
};

const HISTORY_PAGE = 5;

export default function AlertsScreen({ user }) {
  const [alerts, setAlerts] = useState([]);
  const [history, setHistory] = useState([]);
  const [visibleCount, setVisibleCount] = useState(HISTORY_PAGE);
  const [deviceMap, setDeviceMap] = useState({});

  useEffect(() => {
    let mounted = true;
    fetchAlerts(false, user.userId).then((a) => { if (mounted) setAlerts(a || []); });
    fetchAlerts(undefined, user.userId).then((a) => { if (mounted) setHistory(a || []); });
    fetchUserDevices(user.userId).then((devs) => {
      if (!mounted) return;
      const map = {};
      (devs || []).forEach((d) => { map[d.device_id] = d.device_name || d.device_id; });
      setDeviceMap(map);
    });
    return () => { mounted = false; };
  }, [user.userId]);

  const handleResolve = async (alertId) => {
    setAlerts((prev) => prev.filter((it) => it.alert_id !== alertId));
    await resolveAlert(alertId);
    fetchAlerts(undefined, user.userId).then((a) => setHistory(a || []));
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.greenBody}>
        {/* Active Alerts */}
        {alerts.length === 0 ? (
          <View style={styles.alertBanner}>
            <Text style={styles.alertBannerText}>No active alerts</Text>
          </View>
        ) : (
          alerts.map((a) => (
            <View key={a.alert_id} style={styles.alertRow}>
              <View style={styles.alertTextWrap}>
                <Text style={styles.alertBannerText}>⚠️ {a.title}</Text>
                <Text style={styles.alertDetails}>{a.details}</Text>
                <Text style={styles.alertDevice}>Device: {deviceMap[a.device_id] || a.device_id}</Text>
                <Text style={styles.alertTime}>{a.timestamp}</Text>
              </View>
              <TouchableOpacity style={styles.resolveButton} onPress={() => handleResolve(a.alert_id)}>
                <Text style={styles.resolveText}>Resolve</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        {/* Alert History */}
        <View style={styles.card}>
          <Text style={styles.historyTitle}>Alert History</Text>
          {history.length === 0 ? (
            <Text style={styles.historyItem}>No alert history.</Text>
          ) : (
            <>
              {history.slice(0, visibleCount).map((a) => (
                <Text key={a.alert_id} style={styles.historyItem}>
                  • {a.timestamp} — {a.title}{a.resolved ? ' ✓' : ''}{'\n'}  Device: {deviceMap[a.device_id] || a.device_id}
                </Text>
              ))}
              {visibleCount < history.length && (
                <TouchableOpacity
                  style={styles.showMoreBtn}
                  onPress={() => setVisibleCount((c) => c + HISTORY_PAGE)}
                >
                  <Text style={styles.showMoreText}>
                    Show more ({history.length - visibleCount} remaining)
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  contentContainer: {
    flexGrow: 1,
  },
  greenBody: {
    backgroundColor: COLORS.darkGreen,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: 20,
    paddingHorizontal: 20,
    paddingTop: 24,
    flexGrow: 1,
  },
  alertBanner: {
    backgroundColor: '#fce4ec',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  alertBannerText: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  alertRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fce4ec', borderRadius: 14, padding: 12, marginBottom: 10 },
  alertTextWrap: { flex: 1, paddingRight: 8 },
  alertDetails: { color: '#333', marginTop: 6 },
  alertDevice: { color: '#555', fontSize: 12, fontWeight: '600', marginTop: 4 },
  alertTime: { color: '#666', fontSize: 11, marginTop: 6 },
  resolveButton: { backgroundColor: '#1a8cff', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  resolveText: { color: '#fff', fontWeight: '600' },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  historyItem: {
    fontSize: 13,
    color: '#444',
    lineHeight: 22,
  },
  showMoreBtn: {
    marginTop: 10,
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  showMoreText: {
    fontSize: 13,
    color: '#3a6b35',
    fontWeight: '600',
  },
});
