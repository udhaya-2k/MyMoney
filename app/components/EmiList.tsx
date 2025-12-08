import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "../styles/CashFlowStyles";

type Loan = {
  id: string;
  name: string;
  emi: number;
  dueDate: string;
};

type Props = {
  loans: Loan[];
  getColor: (date: string) => string;
  onPay: (loanId: string) => void;
};

export default function EmiList({ loans, getColor, onPay }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Upcoming EMIs</Text>

      {loans.length === 0 ? (
        <Text style={styles.emptyText}>No EMIs added yet</Text>
      ) : (
        loans.map((loan) => {
          const color = getColor(loan.dueDate);

          return (
            <View key={loan.id} style={styles.emiRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.emiTitle}>{loan.name}</Text>
                <Text style={styles.emiInfo}>
                  Due: <Text style={{ color }}>{loan.dueDate}</Text>
                </Text>
              </View>

              <View style={{ alignItems: "flex-end" }}>
                <Text style={[styles.emiAmount, { color }]}>₹{loan.emi}</Text>

                <TouchableOpacity
                  onPress={() => onPay(loan.id)}
                  style={[styles.payEmiBtn, { backgroundColor: color }]}
                >
                  <Text style={styles.payEmiText}>Pay</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}
