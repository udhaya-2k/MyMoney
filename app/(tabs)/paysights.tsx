import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function Paysights() {
  const [salary, setSalary] = useState<number>(0);
  const [goal, setGoal] = useState<number>(0);
  const [loans, setLoans] = useState<any[]>([]);

  useEffect(() => {
    loadProfile();
    loadLoans();
  }, []);

  const loadProfile = async () => {
    const data = await AsyncStorage.getItem('profile');
    if (data) {
      const parsed = JSON.parse(data);
      setSalary(Number(parsed.salary || 0));
      setGoal(Number(parsed.savingsGoal || 0));
    }
  };

  const loadLoans = async () => {
    const data = await AsyncStorage.getItem('loans');
    if (data) {
      setLoans(JSON.parse(data));
    }
  };

  const totalEmi = loans.reduce((sum, loan) => sum + Number(loan.emi || 0), 0);

  const savingsThisMonth = salary - totalEmi;

  const isGoalMet = savingsThisMonth >= goal;

  // Pie chart data
  const pieData = [
    {
      name: 'Savings',
      population: savingsThisMonth > 0 ? savingsThisMonth : 0,
      color: '#22C55E',
      legendFontColor: '#111827',
      legendFontSize: 14,
    },
    {
      name: 'EMIs',
      population: totalEmi,
      color: '#EF4444',
      legendFontColor: '#111827',
      legendFontSize: 14,
    },
  ];

  // Bar chart data
  const barData = {
    labels: ['Salary', 'EMI', 'Savings'],
    datasets: [
      {
        data: [salary, totalEmi, savingsThisMonth],
      },
    ],
  };

  return (
    
    <ScrollView 
  style={styles.container}
  contentContainerStyle={{ paddingBottom: 20 }}
>

      {/* Header */}
      <View style={styles.headerCard}>
        <Text style={styles.headerText}>Paysights</Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.card}>
        <Text style={styles.label}>Monthly Salary</Text>
        <Text style={styles.value}>₹ {salary}</Text>

        <Text style={styles.label}>Savings Goal</Text>
        <Text style={styles.value}>₹ {goal}</Text>
      </View>

      {/* Savings Status */}
      <View style={styles.card}>
        <Text style={styles.label}>Savings This Month</Text>
        <Text
          style={[
            styles.value,
            { color: isGoalMet ? '#22C55E' : '#EF4444' },
          ]}
        >
          ₹ {savingsThisMonth}
        </Text>

        <Text style={styles.statusText}>
          {isGoalMet ? '✅ Goal Achieved' : '❌ Goal Not Met'}
        </Text>
      </View>

      {/* EMI Status */}
      <View style={styles.card}>
        <Text style={styles.label}>EMI Status</Text>
        <Text style={styles.value}>
          {loans.length === 0 ? 'No EMIs' : `${loans.length} Active EMIs`}
        </Text>
      </View>

      {/* Pie Chart */}
      <View style={styles.card}>
        <Text style={styles.chartTitle}>Savings vs EMI</Text>
        <PieChart
          data={pieData}
          width={screenWidth - 64}
          height={220}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>

      {/* Bar Chart */}
      <View style={styles.card}>
        <Text style={styles.chartTitle}>Income Breakdown</Text>
        <BarChart
          data={barData}
          width={screenWidth - 64}
          height={220}
          yAxisLabel="₹"
          yAxisSuffix=""
          chartConfig={chartConfig}
          verticalLabelRotation={0}
          fromZero
        />
      </View>
    </ScrollView>
  );
}

const chartConfig = {
  backgroundColor: '#FFFFFF',
  backgroundGradientFrom: '#FFFFFF',
  backgroundGradientTo: '#FFFFFF',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
  labelColor: () => '#6B7280',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
  },
  headerText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  label: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 10,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
  },
  statusText: {
    marginTop: 6,
    fontSize: 14,
    color: '#6B7280',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#111827',
  },
});
