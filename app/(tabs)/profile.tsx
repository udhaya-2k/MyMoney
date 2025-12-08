import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ----------------------
// Types
// ----------------------
export type Loan = {
  id: string;
  name: string;
  amount: number;
  emi: number;
  dueDate: string;
  totalAmount: number;
  tenure: number;
  startDate: string;
  endDate: string;
  interest: number;
};

export type Profile = {
  name: string;
  salary: number;
  otherIncome?: number;
  savingsGoal: number;
};

// ----------------------

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile>({
    name: "",
    salary: 0,
    otherIncome: 0,
    savingsGoal: 0,
  });

  const [isEditing, setIsEditing] = useState(true);

  const [loans, setLoans] = useState<Loan[]>([]);

  // Loan input
  const [loanInput, setLoanInput] = useState<Partial<Loan>>({
    name: "",
    amount: 0,
    emi: 0,
    dueDate: "",
    totalAmount: 0,
    tenure: 0,
    startDate: "",
    endDate: "",
    interest: 0,
  });

  // ----------------------
  // Load from storage
  // ----------------------
  useEffect(() => {
    loadProfile();
    loadLoans();
  }, []);

  const loadProfile = async () => {
    const data = await AsyncStorage.getItem("profile");
    if (data) {
      const saved = JSON.parse(data);
      setProfile(saved);
      setIsEditing(false); // disable fields after loading
    }
  };

  const loadLoans = async () => {
    const data = await AsyncStorage.getItem("loans");
    if (data) setLoans(JSON.parse(data));
  };

  // ----------------------
  // Save Profile
  // ----------------------
  const saveProfile = async () => {
    if (!profile.name || profile.salary <= 0 || profile.savingsGoal <= 0) {
      Alert.alert("Error", "Name, Salary & Savings Goal are required");
      return;
    }

    await AsyncStorage.setItem("profile", JSON.stringify(profile));
    Alert.alert("Success", "Profile saved!");

    setIsEditing(false); // Disable after saving
  };

  // ----------------------
  // Add Loan
  // ----------------------
  const addLoan = async () => {
    if (!loanInput.name || !loanInput.amount || !loanInput.emi || !loanInput.dueDate) {
      Alert.alert("Error", "Please fill loan name, amount, EMI & due date");
      return;
    }

    const newLoan: Loan = {
      id: Date.now().toString(),
      name: loanInput.name!,
      amount: Number(loanInput.amount),
      emi: Number(loanInput.emi),
      dueDate: loanInput.dueDate!,
      totalAmount: Number(loanInput.totalAmount || 0),
      tenure: Number(loanInput.tenure || 0),
      startDate: loanInput.startDate || "",
      endDate: loanInput.endDate || "",
      interest: Number(loanInput.interest || 0),
    };

    const updated = [...loans, newLoan];
    setLoans(updated);
    await AsyncStorage.setItem("loans", JSON.stringify(updated));

    // reset inputs
    setLoanInput({
      name: "",
      amount: 0,
      emi: 0,
      dueDate: "",
      totalAmount: 0,
      tenure: 0,
      startDate: "",
      endDate: "",
      interest: 0,
    });

    Alert.alert("Success", "Loan Added");
  };

  // ----------------------
  // Delete Loan
  // ----------------------
  const deleteLoan = async (id: string) => {
    const updated = loans.filter((loan) => loan.id !== id);
    setLoans(updated);
    await AsyncStorage.setItem("loans", JSON.stringify(updated));
  };

  // ----------------------
  // Render
  // ----------------------
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>

      {/* PROFILE SECTION */}
      <Text style={styles.title}>Profile</Text>

      <View style={styles.card}>
        <TextInput
          placeholder="Full Name"
          style={styles.input}
          value={profile.name}
          editable={isEditing}
          onChangeText={(text) => setProfile({ ...profile, name: text })}
        />

        <TextInput
          placeholder="Monthly Salary (INR)"
          keyboardType="numeric"
          style={styles.input}
          editable={isEditing}
          value={String(profile.salary)}
          onChangeText={(text) =>
            setProfile({ ...profile, salary: Number(text) })
          }
        />

        <TextInput
          placeholder="Other Income (Optional)"
          keyboardType="numeric"
          style={styles.input}
          editable={isEditing}
          value={String(profile.otherIncome || "")}
          onChangeText={(text) =>
            setProfile({ ...profile, otherIncome: Number(text) })
          }
        />

        <TextInput
          placeholder="Monthly Savings Goal"
          keyboardType="numeric"
          style={styles.input}
          editable={isEditing}
          value={String(profile.savingsGoal)}
          onChangeText={(text) =>
            setProfile({ ...profile, savingsGoal: Number(text) })
          }
        />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => {
            if (isEditing) saveProfile();
            else setIsEditing(true); // switch to edit mode
          }}
        >
          <Text style={styles.saveButtonText}>
            {isEditing ? "Save Profile" : "Edit Profile"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* LOAN SECTION */}
      <Text style={styles.title}>Loans & EMI</Text>

      <View style={styles.card}>
        <TextInput
          placeholder="Loan Name"
          style={styles.input}
          value={loanInput.name}
          onChangeText={(text) => setLoanInput({ ...loanInput, name: text })}
        />

        <TextInput
          placeholder="Loan Amount"
          keyboardType="numeric"
          style={styles.input}
          value={String(loanInput.amount || "")}
          onChangeText={(text) =>
            setLoanInput({ ...loanInput, amount: Number(text) })
          }
        />

        <TextInput
          placeholder="Monthly EMI"
          keyboardType="numeric"
          style={styles.input}
          value={String(loanInput.emi || "")}
          onChangeText={(text) =>
            setLoanInput({ ...loanInput, emi: Number(text) })
          }
        />

        <TextInput
          placeholder="EMI Due Date (DD/MM/YYYY)"
          style={styles.input}
          value={loanInput.dueDate}
          onChangeText={(text) =>
            setLoanInput({ ...loanInput, dueDate: text })
          }
        />

        <TouchableOpacity style={styles.addButton} onPress={addLoan}>
          <Text style={styles.addButtonText}>Add Loan</Text>
        </TouchableOpacity>
      </View>

      {/* Existing Loans */}
      {loans.map((loan) => (
        <View key={loan.id} style={styles.loanCard}>
          <Text style={styles.loanName}>{loan.name}</Text>
          <Text>EMI: ₹ {loan.emi}</Text>
          <Text>Due: {loan.dueDate}</Text>

          <TouchableOpacity onPress={() => deleteLoan(loan.id)}>
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      ))}

    </ScrollView>
  );
}

// ----------------------
// Styles
// ----------------------
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F9FAFB" },
  title: { fontSize: 20, fontWeight: "700", marginTop: 20, marginBottom: 10 },
  card: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 3,
  },
  input: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: "#4F46E5",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: { color: "#FFF", fontWeight: "700" },
  addButton: {
    backgroundColor: "#10B981",
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
    alignItems: "center",
  },
  addButtonText: { color: "#FFF", fontWeight: "700" },
  loanCard: {
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  loanName: { fontSize: 16, fontWeight: "700" },
  deleteText: { color: "#EF4444", marginTop: 5 },
});
