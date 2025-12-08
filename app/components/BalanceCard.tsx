import React from "react";
import { Text, View } from "react-native";
import { styles } from "../styles/CashFlowStyles";

type Props = {
  balance: number;
};

export default function BalanceCard({ balance }: Props) {
  return (
    <View style={styles.balanceCard}>
      <Text style={styles.balanceLabel}>Current Balance</Text>
      <Text style={styles.balanceAmount}>₹ {balance.toFixed(2)}</Text>
    </View>
  );
}
