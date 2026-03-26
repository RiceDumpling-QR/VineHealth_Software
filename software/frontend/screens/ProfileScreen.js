import { StyleSheet, Text, View, ScrollView } from 'react-native';

const COLORS = {
  darkGreen: '#3a6b35',
  white: '#ffffff',
  textDark: '#1a1a1a',
  textGray: '#666666',
};

export default function ProfileScreen() {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.greenBody}>
        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          <View style={styles.avatar} />
        </View>
        <Text style={styles.name}>Name</Text>

        {/* Plants Info */}
        <Text style={styles.sectionTitle}>Plants Info</Text>
        <View style={styles.card}>
          <View style={styles.statsRow}>
            <View style={styles.statCell}>
              <Text style={styles.statMain}>Healthy</Text>
              <Text style={styles.statSub}>NDVI: 0.83</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statCell}>
              <Text style={styles.statMain}>53%</Text>
              <Text style={styles.statSub}>Relative{'\n'}Humidity (RH)</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statCell}>
              <Text style={styles.statMain}>65 F</Text>
              <Text style={styles.statSub}>Temperature</Text>
            </View>
          </View>
        </View>

        {/* User Stats */}
        <Text style={styles.sectionTitle}>User Stats</Text>
        <View style={styles.card}>
          <View style={styles.statsRow}>
            <View style={styles.statCell}>
              <Text style={styles.statMain}>5</Text>
              <Text style={styles.statSub}>days active</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statCell}>
              <Text style={styles.statMain}>100sqft</Text>
              <Text style={styles.statSub}>Plats Area</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statCell}>
              <Text style={styles.statMain}>4</Text>
              <Text style={styles.statSub}>crop species</Text>
            </View>
          </View>
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
    paddingTop: 20,
    flexGrow: 1,
  },
  avatarWrapper: {
    alignItems: 'center',
    marginTop: -50,
    marginBottom: 12,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#c8e6c9',
  },
  name: {
    color: COLORS.white,
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  statMain: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  statSub: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
  },
});
