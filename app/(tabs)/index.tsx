import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  View
} from "react-native";
import BalanceCard from "../../components/BalanceCard";
import EmiList from "../../components/EmiList";
import TransactionForm from "../../components/TransactionForm";
import TransactionsList from "../../components/TransactionsList";
import { styles } from '../../styles/CashFlowStyles';

// ----------------------
// Types
// ----------------------
type Loan = {
  id: string;
  name: string;
  amount?: number;
  emi: number;
  dueDate: string; // "DD/MM/YYYY" expected
  // other fields optional
};

type Transaction = {
  id: string;
  type: "IN" | "OUT";
  title: string;
  amount: number;
  date: string; // ISO
};

// ----------------------
// Storage keys
// ----------------------
const PROFILE_KEY = "profile";
const LOANS_KEY = "loans";
const TX_KEY = "transactions";
const BAL_KEY = "currentBalance";
const SAVINGS_RECORDS_KEY = "monthlySavingsRecords";

// ----------------------
// Helpers
// ----------------------
const parseDateDMY = (str: string | undefined | null): Date | null => {
  if (!str) return null;
  if (str.includes("/")) {
    const [d, m, y] = str.split("/");
    const dt = new Date(Number(y), Number(m) - 1, Number(d));
    return isNaN(dt.getTime()) ? null : dt;
  }
  const dt = new Date(str);
  return isNaN(dt.getTime()) ? null : dt;
};

const formatDMY = (d: Date) => {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  return `${dd}/${mm}/${yy}`;
};

const addMonths = (date: Date, months: number) => {
  const d = new Date(date);
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);

  // handle month overflow (e.g., Jan 31 + 1 month -> Feb 28/29)
  if (d.getDate() < day) {
    d.setDate(0); // last day of previous month
  }
  return d;
};

const emiStatusColor = (dueStr: string | undefined | null) => {
  const due = parseDateDMY(dueStr);
  if (!due) return "#6B7280";
  const today = new Date();
  const normalize = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
  const diffDays = Math.round((normalize(due).getTime() - normalize(today).getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "#EF4444"; // red: past due
  if (diffDays <= 2) return "#F59E0B"; // amber: due within 2 days (today/tomorrow/2 days)
  return "#10B981"; // green: future
};

// For permanent folder: use documentDirectory if available else cacheDirectory
const getDocsBase = () => {
  // (FileSystem as any) avoids TS type mismatch in some Expo versions
  return (FileSystem as any).documentDirectory || (FileSystem as any).cacheDirectory || "";
};

// ----------------------
// Component
// ----------------------
export default function CashFlowScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<number>(0);

  const [inputAmount, setInputAmount] = useState("");
  const [inputTitle, setInputTitle] = useState("");
  const [inputType, setInputType] = useState<"IN" | "OUT">("IN");

  useEffect(() => {
    (async () => {
      await ensurePdfDirectory();
      await loadProfileAndBalance();
      await loadLoans();
      await loadTransactions();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------------
  // Storage load/persist
  // ----------------------
  const loadProfileAndBalance = async () => {
    try {
      const raw = await AsyncStorage.getItem(PROFILE_KEY);
      if (!raw) return;
      const p = JSON.parse(raw);
      setProfile(p);

      const balRaw = await AsyncStorage.getItem(BAL_KEY);
      if (balRaw != null) {
        setBalance(Number(balRaw));
      } else {
        const start = Number(p.salary || 0) + Number(p.otherIncome || 0 || 0);
        setBalance(start);
        await AsyncStorage.setItem(BAL_KEY, String(start));
      }
    } catch (e) {
      console.warn("loadProfileAndBalance", e);
    }
  };

  const loadLoans = async () => {
    try {
      const raw = await AsyncStorage.getItem(LOANS_KEY);
      setLoans(raw ? JSON.parse(raw) : []);
    } catch (e) {
      console.warn("loadLoans", e);
      setLoans([]);
    }
  };

  const loadTransactions = async () => {
    try {
      const raw = await AsyncStorage.getItem(TX_KEY);
      setTransactions(raw ? JSON.parse(raw) : []);
    } catch (e) {
      console.warn("loadTransactions", e);
      setTransactions([]);
    }
  };

  const persistTransactions = async (txs: Transaction[]) => {
    setTransactions(txs);
    await AsyncStorage.setItem(TX_KEY, JSON.stringify(txs));
  };

  const persistLoans = async (ls: Loan[]) => {
    setLoans(ls);
    await AsyncStorage.setItem(LOANS_KEY, JSON.stringify(ls));
  };

  const persistBalance = async (b: number) => {
    setBalance(b);
    await AsyncStorage.setItem(BAL_KEY, String(b));
  };

  // ----------------------
  // PDF directory setup (permanent folder)
  // ----------------------
  const ensurePdfDirectory = async () => {
    try {
      const base = getDocsBase();
      if (!base) return; // fallback safe-guard
      const folder = base + "pdfs/";
      const info = await FileSystem.getInfoAsync(folder);
      if (!info.exists) {
        await FileSystem.makeDirectoryAsync(folder, { intermediates: true });
      }
    } catch (e) {
      console.warn("ensurePdfDirectory err", e);
    }
  };

  // ----------------------
  // PDF creation & permanent save
  // ----------------------
  const generateAndSavePdfPermanently = async (txs: Transaction[]) => {
    const rows = txs
      .map(
        (t) =>
          `<tr>
            <td style="padding:8px;border:1px solid #ddd">${new Date(t.date).toLocaleString()}</td>
            <td style="padding:8px;border:1px solid #ddd">${t.type}</td>
            <td style="padding:8px;border:1px solid #ddd">${t.title}</td>
            <td style="padding:8px;border:1px solid #ddd">₹${t.amount.toFixed(2)}</td>
          </tr>`
      )
      .join("");

    const html = `
      <html>
        <head><meta charset="utf-8"/></head>
        <body style="font-family: Arial, sans-serif; padding: 12px;">
          <h2>Transactions</h2>
          <table style="border-collapse: collapse; width:100%;">
            <thead>
              <tr>
                <th style="border:1px solid #ddd;padding:8px">Date</th>
                <th style="border:1px solid #ddd;padding:8px">Type</th>
                <th style="border:1px solid #ddd;padding:8px">Title</th>
                <th style="border:1px solid #ddd;padding:8px">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </body>
      </html>
    `;

    // printToFileAsync gives { uri }
    const { uri } = await Print.printToFileAsync({ html });

    // move to permanent folder
    const base = getDocsBase();
    const folder = base + "pdfs/";
    const filename = `Transactions-${new Date().toISOString().slice(0, 19).replace(/[:.]/g, "-")}.pdf`;
    const dest = folder + filename;

    // On some platforms moving is fine, otherwise copy + delete
    try {
      await FileSystem.moveAsync({ from: uri, to: dest });
    } catch (err) {
      // fallback: copy then delete
      await FileSystem.copyAsync({ from: uri, to: dest });
      try {
        await FileSystem.deleteAsync(uri);
      } catch (_) {}
    }

    return dest;
  };

  // ----------------------
  // Download & Delete button handler (PDF saved permanently)
  // ----------------------
  const downloadAndDeleteTransactions = async () => {
    try {
      if (transactions.length === 0) {
        Alert.alert("No transactions", "There are no transactions to download.");
        return;
      }

      const uri = await generateAndSavePdfPermanently(transactions);

      // share
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Download Transactions (PDF)",
          UTI: "com.adobe.pdf",
        });
      } else {
        Alert.alert("Saved", "PDF saved to app folder: pdfs/");
      }

      // move current balance to monthly savings record
      const savedRecordsRaw = (await AsyncStorage.getItem(SAVINGS_RECORDS_KEY)) || "[]";
      const savedRecords = JSON.parse(savedRecordsRaw);
      savedRecords.push({
        month: new Date().toISOString().slice(0, 7), // YYYY-MM
        amount: Number(balance || 0),
        date: new Date().toISOString(),
        file: uri,
      });
      await AsyncStorage.setItem(SAVINGS_RECORDS_KEY, JSON.stringify(savedRecords));

      // update profile.savings
      const profRaw = await AsyncStorage.getItem(PROFILE_KEY);
      if (profRaw) {
        const p = JSON.parse(profRaw);
        p.savings = Number(p.savings || 0) + Number(balance || 0);
        await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(p));
        setProfile(p);
      }

      // wipe transactions
      await persistTransactions([]);

      // reset balance to salary + otherIncome
      if (profRaw) {
        const p2 = JSON.parse(profRaw);
        const newBal = Number(p2.salary || 0) + Number(p2.otherIncome || 0);
        await persistBalance(newBal);
      } else {
        await persistBalance(0);
      }

      Alert.alert("Done", "PDF saved & transactions cleared. Balance moved to savings.");
    } catch (e) {
      console.warn("downloadAndDeleteTransactions err", e);
      Alert.alert("Error", "Could not create or save PDF");
    }
  };

  // ----------------------
  // Manual transaction
  // ----------------------
  const manualTransaction = async (type: "IN" | "OUT") => {
    const amt = Number(inputAmount);
    if (!amt || amt <= 0) {
      Alert.alert("Invalid amount", "Enter amount > 0");
      return;
    }
    if (type === "OUT" && amt > balance) {
      Alert.alert("Insufficient balance", "Cannot spend more than current balance");
      return;
    }

    const tx: Transaction = {
      id: Date.now().toString(),
      type,
      title: inputTitle || (type === "IN" ? "Pay In" : "Pay Out"),
      amount: amt,
      date: new Date().toISOString(),
    };

    const newTxs = [tx, ...transactions];
    await persistTransactions(newTxs);
    await persistBalance(type === "IN" ? balance + amt : balance - amt);

    setInputAmount("");
    setInputTitle("");
  };

  // ----------------------
  // Pay EMI (recurring): deduct balance, add transaction, advance dueDate by 1 month
  // ----------------------
  const payEmi = async (loanId: string) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return;

    if (loan.emi > balance) {
      Alert.alert("Insufficient balance", "Not enough balance to pay EMI");
      return;
    }

    const tx: Transaction = {
      id: Date.now().toString(),
      type: "OUT",
      title: `EMI Paid: ${loan.name}`,
      amount: loan.emi,
      date: new Date().toISOString(),
    };

    // add transaction and update balance
    await persistTransactions([tx, ...transactions]);
    await persistBalance(balance - loan.emi);

    // advance loan due date by 1 month (recurring)
    const due = parseDateDMY(loan.dueDate);
    if (due) {
      const next = addMonths(due, 1);
      const updatedLoans = loans.map((l) => (l.id === loanId ? { ...l, dueDate: formatDMY(next) } : l));
      await persistLoans(updatedLoans);
    } else {
      // fallback: remove loan if dueDate cannot be parsed
      const updatedLoans = loans.filter((l) => l.id !== loanId);
      await persistLoans(updatedLoans);
    }
  };

  // ----------------------
  // UI
  // ----------------------
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.headerCard}>
        <Text style={styles.headerText}>Cash Flow</Text>
      </View>

      <BalanceCard balance={balance} />

      <TransactionForm
        inputTitle={inputTitle}
        inputAmount={inputAmount}
        inputType={inputType}
        setInputTitle={setInputTitle}
        setInputAmount={setInputAmount}
        setInputType={setInputType}
        onSubmit={manualTransaction}
      />

      {/* Upcoming EMIs */}
      <EmiList loans={loans} getColor={emiStatusColor} onPay={payEmi} />

      {/* Recent transactions header with Download & Delete */}
      <TransactionsList
        transactions={transactions}
        onDownload={downloadAndDeleteTransactions}
      />

    </ScrollView>
  );
}
