import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { styles } from "../styles/CashFlowStyles";

type Props = {
  inputTitle: string;
  inputAmount: string;
  inputType: "IN" | "OUT";
  setInputTitle: (v: string) => void;
  setInputAmount: (v: string) => void;
  setInputType: (v: "IN" | "OUT") => void;
  onSubmit: (type: "IN" | "OUT") => void;
};

export default function TransactionForm({
  inputTitle,
  inputAmount,
  inputType,
  setInputTitle,
  setInputAmount,
  setInputType,
  onSubmit,
}: Props) {
  return (
    <View style={styles.card}>
      <TextInput
        placeholder="Title (optional)"
        value={inputTitle}
        onChangeText={setInputTitle}
        style={styles.input}
      />

      <TextInput
        placeholder="Amount"
        value={inputAmount}
        onChangeText={setInputAmount}
        keyboardType="numeric"
        style={styles.input}
      />

      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity
          style={[styles.payInBtn, inputType === "IN" && styles.selectedType]}
          onPress={() => setInputType("IN")}
        >
          <Text style={styles.payBtnText}>Pay In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.payOutBtn, inputType === "OUT" && styles.selectedType]}
          onPress={() => setInputType("OUT")}
        >
          <Text style={styles.payBtnText}>Pay Out</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.addBtn} onPress={() => onSubmit(inputType)}>
        <Text style={styles.addBtnText}>
          {inputType === "IN" ? "Add Pay In" : "Add Pay Out"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
