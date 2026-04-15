import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { fetchUserDevices, fetchDeviceDates, fetchTrendData } from '../services/api';

const screenWidth = Dimensions.get('window').width;

const COLORS = {
  darkGreen: '#3a6b35',
  lightGreen: '#6aad62',
  mediumGreen: '#4e8c47',
  alertRed: '#e53935',
  white: '#ffffff',
  textDark: '#1a1a1a',
  textGray: '#666666',
  bgGray: '#f1f1f1',
};

const TIME_ORDER = { sunrise: 0, noon: 1, sunset: 2, night: 3 };

export default function TrendScreen({ user }) {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [trendRows, setTrendRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // Which dropdown is open: 'device' | 'start' | 'end' | null
  const [openDropdown, setOpenDropdown] = useState(null);

  // Load user's devices
  useEffect(() => {
    if (!user?.userId) return;
    fetchUserDevices(user.userId).then((devs) => {
      setDevices(devs || []);
      if (devs && devs.length > 0) setSelectedDevice(devs[0].device_id);
    });
  }, [user?.userId]);

  // When device changes, load its available dates and reset range
  useEffect(() => {
    if (!selectedDevice) return;
    fetchDeviceDates(selectedDevice).then((dates) => {
      const sorted = [...(dates || [])].sort(); // ascending
      setAvailableDates(sorted);
      if (sorted.length > 0) {
        setStartDate(sorted[0]);
        setEndDate(sorted[sorted.length - 1]);
      } else {
        setStartDate(null);
        setEndDate(null);
      }
    });
  }, [selectedDevice]);

  // Fetch trend data whenever device + date range are set
  useEffect(() => {
    if (!selectedDevice || !startDate || !endDate) return;
    if (startDate > endDate) return;
    let mounted = true;
    setLoading(true);
    fetchTrendData(selectedDevice, startDate, endDate).then((rows) => {
      if (!mounted) return;
      setTrendRows(rows || []);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, [selectedDevice, startDate, endDate]);

  // Build chart data from trendRows
  const buildChartData = () => {
    if (!trendRows || trendRows.length === 0) return null;

    const sorted = [...trendRows].sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? -1 : 1;
      return (TIME_ORDER[a.time_range] ?? 4) - (TIME_ORDER[b.time_range] ?? 4);
    });

    // Thin out labels if many points to avoid overlap
    const total = sorted.length;
    const step = total > 14 ? Math.ceil(total / 7) : 1;
    const labels = sorted.map((r, i) => {
      if (i % step !== 0 && i !== total - 1) return '';
      const d = r.date || '';
      const parts = d.split('-');
      return parts.length === 3 ? `${parseInt(parts[1])}/${parseInt(parts[2])}` : d;
    });

    const extract = (key) =>
      sorted.map((r) => {
        const v = parseFloat(r[key]);
        return Number.isFinite(v) ? v : 0;
      });

    return {
      labels,
      datasets: [
        { data: extract('ndvi'),  color: (o = 1) => `rgba(106,173,98,${o})`,  strokeWidth: 2 },
        { data: extract('gndvi'), color: (o = 1) => `rgba(78,140,71,${o})`,   strokeWidth: 2 },
        { data: extract('cwsi'),  color: (o = 1) => `rgba(229,57,53,${o})`,   strokeWidth: 2 },
        { data: extract('savi'),  color: (o = 1) => `rgba(58,107,53,${o})`,   strokeWidth: 2 },
      ],
      legend: ['NDVI', 'GNDVI', 'CWSI', 'SAVI'],
    };
  };

  const chartData = buildChartData();

  const toggle = (name) => setOpenDropdown((prev) => (prev === name ? null : name));

  const deviceLabel = () => {
    if (!selectedDevice) return 'Select device';
    const d = devices.find((x) => x.device_id === selectedDevice);
    return d?.device_name ? `${d.device_name} (${selectedDevice})` : selectedDevice;
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.greenBody}>

        {/* Selectors card */}
        <View style={styles.card}>
          {/* Device selector */}
          <Text style={styles.label}>Device</Text>
          <TouchableOpacity style={styles.selector} onPress={() => toggle('device')}>
            <Text style={styles.selectorText}>{deviceLabel()}</Text>
            <Text style={styles.chevron}>{openDropdown === 'device' ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {openDropdown === 'device' && (
            <View style={styles.dropdown}>
              {devices.length === 0
                ? <Text style={styles.dropdownEmpty}>No devices found</Text>
                : devices.map((d) => (
                  <TouchableOpacity
                    key={d.device_id}
                    style={styles.dropdownItem}
                    onPress={() => { setSelectedDevice(d.device_id); setOpenDropdown(null); }}
                  >
                    <Text style={[styles.dropdownItemText, d.device_id === selectedDevice && styles.dropdownItemSelected]}>
                      {d.device_name ? `${d.device_name} (${d.device_id})` : d.device_id}
                    </Text>
                  </TouchableOpacity>
                ))
              }
            </View>
          )}

          {/* Date range row */}
          <View style={styles.dateRow}>
            <View style={styles.datePicker}>
              <Text style={styles.label}>From</Text>
              <TouchableOpacity style={styles.selector} onPress={() => toggle('start')}>
                <Text style={styles.selectorText}>{startDate || '—'}</Text>
                <Text style={styles.chevron}>{openDropdown === 'start' ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {openDropdown === 'start' && (
                <View style={styles.dropdown}>
                  {availableDates.length === 0
                    ? <Text style={styles.dropdownEmpty}>No dates</Text>
                    : availableDates.filter((dt) => !endDate || dt <= endDate).map((dt) => (
                      <TouchableOpacity
                        key={dt}
                        style={styles.dropdownItem}
                        onPress={() => { setStartDate(dt); setOpenDropdown(null); }}
                      >
                        <Text style={[styles.dropdownItemText, dt === startDate && styles.dropdownItemSelected]}>{dt}</Text>
                      </TouchableOpacity>
                    ))
                  }
                </View>
              )}
            </View>

            <View style={styles.datePicker}>
              <Text style={styles.label}>To</Text>
              <TouchableOpacity style={styles.selector} onPress={() => toggle('end')}>
                <Text style={styles.selectorText}>{endDate || '—'}</Text>
                <Text style={styles.chevron}>{openDropdown === 'end' ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {openDropdown === 'end' && (
                <View style={styles.dropdown}>
                  {availableDates.length === 0
                    ? <Text style={styles.dropdownEmpty}>No dates</Text>
                    : availableDates.filter((dt) => !startDate || dt >= startDate).map((dt) => (
                      <TouchableOpacity
                        key={dt}
                        style={styles.dropdownItem}
                        onPress={() => { setEndDate(dt); setOpenDropdown(null); }}
                      >
                        <Text style={[styles.dropdownItemText, dt === endDate && styles.dropdownItemSelected]}>{dt}</Text>
                      </TouchableOpacity>
                    ))
                  }
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Chart card */}
        <View style={styles.card}>
          <Text style={styles.chartTitle}>Vegetation Index Scores</Text>

          {loading ? (
            <View style={styles.centeredBox}>
              <ActivityIndicator color={COLORS.darkGreen} size="small" />
              <Text style={styles.statusText}>Loading data…</Text>
            </View>
          ) : !chartData ? (
            <View style={styles.centeredBox}>
              <Text style={styles.statusText}>No data for selected range</Text>
            </View>
          ) : (
            <>
              <LineChart
                data={chartData}
                width={screenWidth - 72}
                height={200}
                chartConfig={{
                  backgroundColor: COLORS.white,
                  backgroundGradientFrom: COLORS.white,
                  backgroundGradientTo: COLORS.white,
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
                  labelColor: () => COLORS.textGray,
                  propsForDots: { r: '3', strokeWidth: '1' },
                  propsForBackgroundLines: { stroke: '#e0e0e0' },
                }}
                bezier
                style={styles.chart}
                withInnerLines={true}
                withOuterLines={false}
              />
              <Text style={styles.chartXLabel}>Date</Text>

              {/* Legend */}
              <View style={styles.legendRow}>
                {[
                  { label: 'NDVI',  color: COLORS.lightGreen },
                  { label: 'GNDVI', color: COLORS.mediumGreen },
                  { label: 'CWSI',  color: COLORS.alertRed },
                  { label: 'SAVI',  color: COLORS.darkGreen },
                ].map((item) => (
                  <View key={item.label} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                    <Text style={styles.legendLabel}>{item.label}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.pointCount}>{trendRows.length} reading{trendRows.length !== 1 ? 's' : ''}</Text>
            </>
          )}
        </View>

        {/* Index Explanation */}
        <View style={styles.explanationBox}>
          <Text style={styles.explanationTitle}>Index Explanation</Text>
          <Text style={styles.explanationText}>
            NDVI – How green & healthy your crops are. Good: 0.6–0.9
            {'\n'}GNDVI – Measures how well crops absorb nutrients. Good: 0.5–0.8
            {'\n'}CWSI – Crop water stress. Lower is better. Good: 0.0–0.3
            {'\n'}SAVI – Like NDVI but more accurate for sparse crops. Good: 0.5–0.8
          </Text>
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
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    color: COLORS.textGray,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selector: {
    backgroundColor: COLORS.bgGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  selectorText: {
    fontSize: 13,
    color: COLORS.textDark,
    fontWeight: '600',
    flex: 1,
  },
  chevron: {
    fontSize: 10,
    color: COLORS.textGray,
    marginLeft: 6,
  },
  dropdown: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 8,
    maxHeight: 160,
  },
  dropdownEmpty: {
    padding: 10,
    color: COLORS.textGray,
    fontSize: 13,
  },
  dropdownItem: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 13,
    color: COLORS.textDark,
  },
  dropdownItemSelected: {
    color: COLORS.darkGreen,
    fontWeight: '700',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  datePicker: {
    flex: 1,
  },
  chartTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 10,
  },
  chart: {
    borderRadius: 8,
    marginLeft: -16,
  },
  chartXLabel: {
    fontSize: 11,
    color: COLORS.textGray,
    textAlign: 'center',
    marginTop: 2,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 11,
    color: COLORS.textGray,
  },
  pointCount: {
    fontSize: 11,
    color: COLORS.textGray,
    textAlign: 'right',
    marginTop: 6,
  },
  centeredBox: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  statusText: {
    fontSize: 13,
    color: COLORS.textGray,
  },
  explanationBox: {
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  explanationText: {
    fontSize: 13,
    color: '#444',
    lineHeight: 18,
  },
});
