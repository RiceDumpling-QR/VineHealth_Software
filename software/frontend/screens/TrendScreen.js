import { StyleSheet, Text, View, ScrollView, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const COLORS = {
  darkGreen: '#3a6b35',
  lightGreen: '#6aad62',
  mediumGreen: '#4e8c47',
  darkGreen2: '#3a6b35',
  alertRed: '#e53935',
  white: '#ffffff',
  textGray: '#666666',
};

export default function TrendScreen() {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.greenBody}>
        {/* Chart */}
        <View style={styles.card}>
          <Text style={styles.chartYLabel}>Vegetation Index Scores</Text>
          <LineChart
            data={{
              labels: ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'],
              datasets: [
                { data: [0.5, 0.6, 0.55, 0.65, 0.7, 0.68, 0.72], color: (opacity = 1) => `rgba(106,173,98,${opacity})`, strokeWidth: 2 }, // NDVI (lightGreen)
                { data: [0.45, 0.5, 0.48, 0.52, 0.57, 0.56, 0.6], color: (opacity = 1) => `rgba(78,140,71,${opacity})`, strokeWidth: 2 }, // GNDVI (mediumGreen)
                { data: [0.12, 0.15, 0.1, 0.08, 0.11, 0.09, 0.07], color: (opacity = 1) => `rgba(229,57,53,${opacity})`, strokeWidth: 2 }, // CWSI (red)
                { data: [0.48, 0.52, 0.5, 0.55, 0.58, 0.57, 0.6], color: (opacity = 1) => `rgba(58,107,53,${opacity})`, strokeWidth: 2 }, // SAVI (darkGreen)
              ],
              legend: ['NDVI', 'GNDVI', 'CWSI', 'SAVI'],
            }}
            width={screenWidth - 72}
            height={180}
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
          <Text style={styles.chartXLabel}>Days</Text>
        </View>

        {/* Index Explanation box */}
        <View style={styles.explanationBox}>
          <Text style={styles.explanationTitle}>Index Explanation</Text>
          <Text style={styles.explanationText}>
            NDVI – How green & healthy your crops are. Good: 0.6–0.9
            {'\n'}GNDVI – Measures how well crops absorb nutrients. Good: 0.5–0.8
            {'\n'}CWSI – Crop water stress. Lower is better. Good: 0.0–0.3
            {'\n'}SAVI – Like NDVI but more accurate for sparse crops. Good: 0.5–0.8
          </Text>
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
