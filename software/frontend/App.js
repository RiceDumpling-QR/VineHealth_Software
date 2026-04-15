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
import DashboardScreen from './screens/DashboardScreen';
import ProfileScreen from './screens/ProfileScreen';
import TrendScreen from './screens/TrendScreen';
import AlertsScreen from './screens/AlertsScreen';
import LoginScreen from './screens/LoginScreen';
import { useAlertNotifications } from './hooks/useAlertNotifications';

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



function AppContent({ user }) {
  useAlertNotifications(user?.userId);
  return null; // side-effects only
}

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const isHome = activeTab === 'home';

  if (!user) {
    return <LoginScreen onLogin={(userId, username) => setUser({ userId, username })} />;
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'profile': return <ProfileScreen user={user} />;
      case 'trend':   return <TrendScreen user={user} />;
      case 'alerts':  return <AlertsScreen user={user} />;
      default:        return <DashboardScreen user={user} />;
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isHome ? COLORS.darkGreen : COLORS.white }]}>
      <AppContent user={user} />
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
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', height: 140, gap: 6 },
  barItem: { alignItems: 'center', flex: 1 },
  bar: { width: 18, borderRadius: 4 },
  barLabel: { fontSize: 10, color: COLORS.textGray, marginTop: 6 },
});
