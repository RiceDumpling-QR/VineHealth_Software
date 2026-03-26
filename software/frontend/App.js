import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import ProfileScreen from './screens/ProfileScreen';
import TrendScreen from './screens/TrendScreen';
import AlertsScreen from './screens/AlertsScreen';

const screenWidth = Dimensions.get('window').width;

const COLORS = {
  darkGreen: '#3a6b35',
  mediumGreen: '#4e8c47',
  lightGreen: '#6aad62',
  white: '#ffffff',
  alertRed: '#e53935',
  textDark: '#1a1a1a',
  textGray: '#666666',
};

const TABS = ['home', 'profile', 'trend', 'alerts'];

const TAB_TITLES = {
  home: 'Dashboard',
  profile: 'User Profile',
  trend: 'Trend',
  alerts: 'Alerts',
};

function DashboardScreen() {
  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Plant Health Stats:</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statMain}>Healthy</Text>
            <Text style={styles.statSub}>NDVI: 0.83</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statMain}>53%</Text>
            <Text style={styles.statSub}>Relative{'\n'}Humidity (RH)</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statMain}>65 F</Text>
            <Text style={styles.statSub}>Temperature</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Vegetation Index Trend</Text>
          <TouchableOpacity style={styles.seeMoreBtn}>
            <Text style={styles.seeMoreText}>See More</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.chartCard}>
          <Text style={styles.chartYLabel}>NDVI Score</Text>
          <LineChart
            data={{
              labels: ['Day 1', 'Day 4', 'Day 7', 'Day 10', 'Day 13'],
              datasets: [{ data: [0.5, 0.65, 0.45, 0.6, 0.55, 0.7, 0.8, 0.75, 0.85] }],
            }}
            width={screenWidth - 64}
            height={160}
            chartConfig={{
              backgroundColor: COLORS.white,
              backgroundGradientFrom: COLORS.white,
              backgroundGradientTo: COLORS.white,
              decimalPlaces: 1,
              color: () => COLORS.lightGreen,
              labelColor: () => COLORS.textGray,
              propsForDots: { r: '3', strokeWidth: '1', stroke: COLORS.lightGreen },
              propsForBackgroundLines: { stroke: '#e0e0e0' },
            }}
            bezier
            style={styles.chart}
            withInnerLines={true}
            withOuterLines={false}
          />
          <Text style={styles.chartXLabel}>Days</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Critical Alerts</Text>
          <TouchableOpacity style={styles.seeMoreBtn}>
            <Text style={styles.seeMoreText}>See more</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.alertCard}>
          <View style={styles.alertHeader}>
            <View style={styles.alertDot} />
            <Text style={styles.alertTitle}>CRITICAL ALERT</Text>
          </View>
          <Text style={styles.alertLocation}>Block C — Rows 12–18</Text>
          <Text style={styles.alertHeadline}>Rapid plant health decline detected</Text>
          <Text style={styles.alertBody}>Vegetation index dropped 14% in 48 hours.</Text>
          <Text style={styles.alertBody}>
            This pattern is consistent with early disease or acute stress.
          </Text>
          <Text style={styles.alertBody}>
            <Text style={styles.alertBold}>Recommended action: </Text>
            Inspect vines in this block today for visual symptoms.
          </Text>
          <Text style={styles.alertEvidence}>Evidence: NDVI trend ↓, soil moisture normal</Text>
        </View>
      </View>

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const isHome = activeTab === 'home';

  const renderScreen = () => {
    switch (activeTab) {
      case 'profile': return <ProfileScreen />;
      case 'trend':   return <TrendScreen />;
      case 'alerts':  return <AlertsScreen />;
      default:        return <DashboardScreen />;
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isHome ? COLORS.darkGreen : COLORS.white }]}>
      <StatusBar style={isHome ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: isHome ? COLORS.darkGreen : COLORS.white }]}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerIcon}>🌱</Text>
          <Text style={[styles.headerTitle, { color: isHome ? COLORS.white : COLORS.textDark }]}>
            {TAB_TITLES[activeTab]}
          </Text>
        </View>
        <TouchableOpacity style={styles.settingsBtn}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Screen content */}
      <View style={[styles.screenContent, { backgroundColor: isHome ? COLORS.darkGreen : COLORS.white }]}>
        {renderScreen()}
      </View>

      {/* Bottom Nav */}
      <View style={[styles.bottomNav, { backgroundColor: isHome ? COLORS.darkGreen : COLORS.darkGreen }]}>
        {[
          { key: 'home',    icon: '🏠' },
          { key: 'profile', icon: '👤' },
          { key: 'trend',   icon: '🌿' },
          { key: 'alerts',  icon: '🔔' },
        ].map(({ key, icon }) => (
          <TouchableOpacity
            key={key}
            style={styles.navItem}
            onPress={() => setActiveTab(key)}
          >
            <Text style={[styles.navIcon, activeTab === key && styles.navIconActive]}>
              {icon}
            </Text>
            {activeTab === key && <View style={styles.navDot} />}
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIcon: { fontSize: 28 },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  settingsBtn: {
    backgroundColor: '#c8e6c9',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: { fontSize: 18 },
  screenContent: {
    flex: 1,
    overflow: 'hidden',
  },
  // Dashboard styles
  scrollView: {
    flex: 1,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionLabel: {
    color: COLORS.white,
    fontSize: 15,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statMain: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  statSub: {
    fontSize: 11,
    color: COLORS.textGray,
    textAlign: 'center',
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '600',
  },
  seeMoreBtn: {
    borderColor: COLORS.white,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  seeMoreText: { color: COLORS.white, fontSize: 13 },
  chartCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    paddingBottom: 8,
  },
  chartYLabel: { fontSize: 11, color: COLORS.textGray, marginBottom: 4 },
  chart: { borderRadius: 8, marginLeft: -16 },
  chartXLabel: { fontSize: 11, color: COLORS.textGray, textAlign: 'center', marginTop: 2 },
  alertCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
  },
  alertHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  alertDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.alertRed },
  alertTitle: { fontSize: 14, fontWeight: 'bold', color: COLORS.alertRed, letterSpacing: 0.5 },
  alertLocation: { fontSize: 13, fontWeight: '600', color: COLORS.textDark, marginBottom: 4 },
  alertHeadline: { fontSize: 13, fontWeight: '600', color: COLORS.textDark, marginBottom: 6 },
  alertBody: { fontSize: 12, color: COLORS.textGray, marginBottom: 4, lineHeight: 18 },
  alertBold: { fontWeight: '700', color: COLORS.textDark },
  alertEvidence: { fontSize: 12, color: COLORS.textGray, marginTop: 4, fontStyle: 'italic' },
  // Bottom nav
  bottomNav: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.mediumGreen,
    zIndex: 10,
  },
  navItem: { flex: 1, alignItems: 'center' },
  navIcon: { fontSize: 24, opacity: 0.5 },
  navIconActive: { opacity: 1 },
  navDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.white,
    marginTop: 3,
  },
});
