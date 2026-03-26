import { StyleSheet, Text, View, ScrollView, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const COLORS = {
  darkGreen: '#3a6b35',
  lightGreen: '#6aad62',
  white: '#ffffff',
  textGray: '#666666',
};

export default function TrendScreen() {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.greenBody}>
        {/* Chart */}
        <View style={styles.card}>
          <Text style={styles.chartYLabel}>NDVI Score</Text>
          <LineChart
            data={{
              labels: ['Day 1', 'Day 4', 'Day 7', 'Day 10', 'Day 13'],
              datasets: [{ data: [0.5, 0.65, 0.45, 0.6, 0.55, 0.7, 0.8, 0.75, 0.85] }],
            }}
            width={screenWidth - 72}
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

        {/* Trend Analysis */}
        <View style={styles.card}>
          <Text style={styles.analysisTitle}>Trend Analysis</Text>
          <Text style={styles.analysisBullet}>• Plant growth shows a steady rise over the past week.</Text>
          <Text style={styles.analysisBullet}>• Small dips appear but bounce back quickly.</Text>
          <Text style={styles.analysisBullet}>• Overall direction remains positive with stronger peaks.</Text>
          <Text style={styles.analysisBullet}>• Current patterns suggest healthy progress ahead.</Text>
          <Text style={styles.analysisBullet}>...</Text>
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
  chartYLabel: {
    fontSize: 11,
    color: COLORS.textGray,
    marginBottom: 4,
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
  analysisTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  analysisBullet: {
    fontSize: 13,
    color: '#444',
    lineHeight: 20,
    marginBottom: 4,
  },
});
