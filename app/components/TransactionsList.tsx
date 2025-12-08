import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "../styles/CashFlowStyles";

type Transaction = {
  id: string;
  type: "IN" | "OUT";
  title: string;
  amount: number;
};

type Props = {
  transactions: Transaction[];
  onDownload: () => void;
};

export default function TransactionsList({ transactions, onDownload }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Recent Transactions</Text>

      <TouchableOpacity style={[styles.downloadBtn, { alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 8 }]} onPress={onDownload}>
        <Text style={styles.downloadBtnText}>Download & Clear</Text>
      </TouchableOpacity>

      {transactions.length === 0 ? (
        <Text style={styles.emptyText}>No transactions yet</Text>
      ) : (
        transactions.map((tx) => (
          <Text key={tx.id} style={styles.txBullet}>
            • {tx.type === "IN" ? "Pay In" : "Pay Out"} – {tx.title} – ₹{tx.amount.toFixed(2)}
          </Text>
        ))
      )}
    </View>
  );
}
