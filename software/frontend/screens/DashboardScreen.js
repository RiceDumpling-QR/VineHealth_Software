import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { StyleSheet } from 'react-native';
import { fetchData, fetchAlerts, fetchUserDevices, fetchDeviceDates } from '../services/api';

const COLORS = {
  darkGreen: '#3a6b35',
  mediumGreen: '#4e8c47',
  lightGreen: '#6aad62',
  white: '#ffffff',
  alertRed: '#e53935',
  textDark: '#1a1a1a',
  textGray: '#666666',
};

export default function DashboardScreen({ user }) {
  const [devices, setDevices] = useState([]);
  const [dates, setDates] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDevice, setShowDevice] = useState(false);
  const [showDate, setShowDate] = useState(false);

  const [dataRows, setDataRows] = useState([]);
  const [summary, setSummary] = useState({});
  const [alerts, setAlerts] = useState([]);

  // Fetch devices belonging to the logged-in user
  useEffect(() => {
    let mounted = true;
    fetchUserDevices(user.userId).then((devs) => {
      if (!mounted) return;
      setDevices(devs || []);
      if (devs && devs.length > 0) setSelectedDevice(devs[0].device_id);
    });
    return () => { mounted = false; };
  }, [user.userId]);

  useEffect(() => {
    let mounted = true;
    fetchAlerts(false, user.userId).then((a) => { if (mounted) setAlerts(a || []); });
    return () => { mounted = false; };
  }, [user.userId]);

  useEffect(() => {
    if (!selectedDevice) return;
    let mounted = true;
    fetchDeviceDates(selectedDevice).then((ds) => {
      if (!mounted) return;
      setDates(ds || []);
      setSelectedDate((prev) => (ds && ds.length > 0 ? ds[0] : prev));
    });
    return () => { mounted = false; };
  }, [selectedDevice]);

  useEffect(() => {
    if (!selectedDevice) return;
    let mounted = true;
    fetchData(selectedDevice, selectedDate).then((res) => {
      if (!mounted) return;
      setDataRows(res.data || []);
      setSummary(res.summary || {});
    });
    return () => { mounted = false; };
  }, [selectedDevice, selectedDate]);

  // Aggregate real dataRows into averages per time_range
  const aggregateByTimeRange = () => {
    const groups = { sunrise: [], noon: [], sunset: [] };
    dataRows.forEach((r) => {
      const tr = (r.time_range || '').toLowerCase();
      if (groups[tr]) groups[tr].push(r);
    });

    const agg = {};
    Object.keys(groups).forEach((g) => {
      const rows = groups[g];
      const keys = ['ndvi', 'gndvi', 'cwsi', 'savi'];
      const res = {};
      keys.forEach((k) => {
        let sum = 0;
        let cnt = 0;
        rows.forEach((rr) => {
          const v = parseFloat(rr[k]);
          if (Number.isFinite(v)) { sum += v; cnt += 1; }
        });
        res[k] = cnt > 0 ? sum / cnt : 0;
      });
      agg[g] = res;
    });
    return agg;
  };

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Environmental Stats:</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statMain}>
              {summary.avg_relative_humidity != null ? `${summary.avg_relative_humidity.toFixed(1)}%` : '—'}
            </Text>
            <Text style={styles.statSub}>Relative{"\n"}Humidity (RH)</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statMain}>
              {summary.avg_temperature != null ? `${summary.avg_temperature.toFixed(1)} °C` : '—'}
            </Text>
            <Text style={styles.statSub}>Temperature</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Vegetation Index Summary</Text>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.selectorRow}>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => { setShowDevice(!showDevice); setShowDate(false); }}
            >
              <Text style={styles.selectorText}>Device: {selectedDevice}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => { setShowDate(!showDate); setShowDevice(false); }}
            >
              <Text style={styles.selectorText}>Date: {selectedDate}</Text>
            </TouchableOpacity>
          </View>

          {showDevice && (
            <View style={styles.dropdown}>
              {devices.length === 0
                ? <Text style={{ padding: 8, color: COLORS.textGray }}>No devices</Text>
                : devices.map((d) => (
                  <TouchableOpacity key={d.device_id} style={styles.dropdownItem} onPress={() => { setSelectedDevice(d.device_id); setShowDevice(false); }}>
                    <Text>{d.device_id}{d.device_name ? ` — ${d.device_name}` : ''}</Text>
                  </TouchableOpacity>
                ))
              }
            </View>
          )}

          {showDate && (
            <View style={styles.dropdown}>
              {dates.length === 0
                ? <Text style={{ padding: 8, color: COLORS.textGray }}>No data</Text>
                : dates.map((dt) => (
                  <TouchableOpacity key={dt} style={styles.dropdownItem} onPress={() => { setSelectedDate(dt); setShowDate(false); }}>
                    <Text>{dt}</Text>
                  </TouchableOpacity>
                ))}
            </View>
          )}

          <View style={styles.barChartContainer}>
            <View style={styles.barYAxis}>
              <Text style={styles.yLabel}>1.0</Text>
              <Text style={styles.yLabel}>0.5</Text>
              <Text style={styles.yLabel}>0.0</Text>
            </View>

            <View style={styles.barGroupsRow}>
              {['sunrise', 'noon', 'sunset'].map((group) => {
                const aggregates = aggregateByTimeRange();
                const vals = aggregates[group] || { ndvi: 0, gndvi: 0, cwsi: 0, savi: 0 };
                return (
                  <View key={group} style={styles.barGroup}>
                    <Text style={styles.groupLabel}>{group}</Text>
                    <View style={styles.barsRow}>
                      {[
                        { key: 'ndvi', color: COLORS.lightGreen },
                        { key: 'gndvi', color: COLORS.mediumGreen },
                        { key: 'cwsi', color: COLORS.alertRed },
                        { key: 'savi', color: COLORS.darkGreen },
                      ].map((m) => {
                        const v = vals[m.key] ?? 0;
                        const height = Math.max(4, Math.round(v * 120));
                        return (
                          <View key={m.key} style={styles.barItem}>
                            <View style={[styles.bar, { height, backgroundColor: m.color }]} />
                            <Text style={styles.barLabel}>{m.key.toUpperCase()}</Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Critical Alerts</Text>
        </View>
        <View style={styles.alertCard}>
          {alerts.length === 0 ? (
            <Text style={{ color: COLORS.textGray }}>No critical alerts</Text>
          ) : (
            alerts.map((a) => (
              <View key={a.alert_id} style={{ marginBottom: 8 }}>
                <Text style={{ fontWeight: '700' }}>{a.title}</Text>
                <Text style={{ color: COLORS.textGray }}>{a.details}</Text>
              </View>
            ))
          )}
        </View>
      </View>

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  section: { marginHorizontal: 16, marginBottom: 16 },
  sectionLabel: { color: COLORS.white, fontSize: 15, marginBottom: 10 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, backgroundColor: COLORS.white, borderRadius: 12, padding: 12, alignItems: 'center' },
  statMain: { fontSize: 16, fontWeight: 'bold', color: COLORS.textDark },
  statSub: { fontSize: 11, color: COLORS.textGray, textAlign: 'center', marginTop: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { color: COLORS.white, fontSize: 17, fontWeight: '600' },
  chartCard: { backgroundColor: COLORS.white, borderRadius: 12, padding: 16, paddingBottom: 8 },
  selectorRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  selector: { backgroundColor: '#f1f1f1', padding: 8, borderRadius: 8 },
  selectorText: { color: COLORS.textDark, fontWeight: '600' },
  dropdown: { backgroundColor: COLORS.white, borderRadius: 8, marginTop: 6, padding: 6 },
  dropdownItem: { paddingVertical: 8, paddingHorizontal: 6 },
  barChartContainer: { flexDirection: 'row', marginTop: 12 },
  barYAxis: { width: 30, alignItems: 'flex-end', paddingRight: 6 },
  yLabel: { fontSize: 10, color: COLORS.textGray, height: 40 },
  barGroupsRow: { flexDirection: 'row', flex: 1, justifyContent: 'space-between' },
  barGroup: { alignItems: 'center', flex: 1 },
  groupLabel: { fontSize: 12, color: COLORS.textGray, marginBottom: 6, textTransform: 'capitalize' },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', height: 140, justifyContent: 'center' },
  barItem: { alignItems: 'center', width: 18 },
  bar: { width: '100%', borderRadius: 4 },
  barLabel: { fontSize: 10, color: COLORS.textGray, marginTop: 6 },
  alertCard: { backgroundColor: COLORS.white, borderRadius: 12, padding: 16 },
});
