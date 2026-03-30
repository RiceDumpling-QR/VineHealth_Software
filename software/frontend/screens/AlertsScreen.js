import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { fetchAlerts, resolveAlert } from '../services/api';

const COLORS = {
  darkGreen: '#3a6b35',
  white: '#ffffff',
};

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    let mounted = true;
    // fetch only unresolved alerts by default
    fetchAlerts(false).then((a) => { if (mounted) setAlerts(a || []); });
    return () => { mounted = false; };
  }, []);

  const handleResolve = async (alertId) => {
    // Optimistically remove from UI
    setAlerts((prev) => prev.filter((it) => it.alert_id !== alertId));
    // Try to notify backend; ignore result (backend may not implement patch)
    try { await resolveAlert(alertId); } catch (e) { /* ignore */ }
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
                <Text style={styles.alertTime}>{a.timestamp}</Text>
              </View>
              <TouchableOpacity style={styles.resolveButton} onPress={() => handleResolve(a.alert_id)}>
                <Text style={styles.resolveText}>Resolve</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        {/* Alert History (kept simple) */}
        <View style={styles.card}>
          <Text style={styles.historyTitle}>Alert History</Text>
          <Text style={styles.historyItem}>• 2026-02-09 — Temperature spike detected</Text>
          <Text style={styles.historyItem}>• 2026-02-08 — Soil moisture dropped below safe level</Text>
          <Text style={styles.historyItem}>• 2026-02-07 — Light exposure unusually low</Text>
          <Text style={styles.historyItem}>...</Text>
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
});
