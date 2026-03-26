import { StyleSheet, Text, View, ScrollView } from 'react-native';

const COLORS = {
  darkGreen: '#3a6b35',
  white: '#ffffff',
};

export default function AlertsScreen() {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.greenBody}>
        {/* Active Alerts */}
        <View style={styles.alertBanner}>
          <Text style={styles.alertBannerText}>⚠️ Critical Alert 1: xxxxxx</Text>
        </View>
        <View style={styles.alertBanner}>
          <Text style={styles.alertBannerText}>⚠️ Critical Alert 2: xxxxxx</Text>
        </View>

        {/* Alert History */}
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
