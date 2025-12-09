import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F9FAFB" },

  headerCard: { backgroundColor: "#FFF", padding: 14, borderRadius: 14, marginBottom: 12 },
  headerText: { fontSize: 20, fontWeight: "700" },

  balanceCard: { backgroundColor: "#4F46E5", padding: 18, borderRadius: 14, marginBottom: 14 },
  balanceLabel: { color: "#E0E7FF" },
  balanceAmount: { color: "#FFFFFF", fontSize: 28, fontWeight: "700", marginTop: 6 },

  card: { backgroundColor: "#FFF", padding: 14, borderRadius: 12, marginBottom: 12 },

  input: { backgroundColor: "#F3F4F6", padding: 12, borderRadius: 10, marginBottom: 10 },

  payInBtn: { flex: 1, backgroundColor: "#22C55E", padding: 10, borderRadius: 10, alignItems: "center", marginRight: 8 },
  payOutBtn: { flex: 1, backgroundColor: "#EF4444", padding: 10, borderRadius: 10, alignItems: "center", marginLeft: 8 },
  selectedType: { opacity: 0.9 },

  payBtnText: { color: "#fff", fontWeight: "700" },

  addBtn: { marginTop: 10, backgroundColor: "#4F46E5", padding: 12, borderRadius: 12, alignItems: "center" },
  addBtnText: { color: "#fff", fontWeight: "700" },

  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },

  emiRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  emiTitle: { fontSize: 15, fontWeight: "700" },
  emiInfo: { fontSize: 12, color: "#6B7280" },
  emiAmount: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  payEmiBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  payEmiText: { color: "#fff", fontWeight: "700" },

  emptyText: { color: "#6B7280", fontStyle: "italic" },

  downloadBtn: { backgroundColor: "#111827", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  downloadBtnText: { color: "#fff", fontWeight: "700" },

  txBullet: {
    fontSize: 14,
    marginVertical: 4,
    color: "#111827",
  },
});
