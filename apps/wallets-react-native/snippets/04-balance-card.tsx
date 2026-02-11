import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useWallet } from "@crossmint/client-sdk-react-native-ui";

export function BalanceCard() {
  const { wallet } = useWallet();
  const [balance, setBalance] = useState<string | null>(null);

  const refreshBalance = async () => {
    if (!wallet) return;
    const balances = await wallet.balances(["usdxm"]);
    const token = balances.tokens.find((t) => t.symbol === "usdxm");
    setBalance(token?.amount ?? "0");
  };

  const handleFund = async () => {
    if (!wallet) return;
    await wallet.stagingFund(10);
    await refreshBalance();
  };

  return (
    <View style={{ backgroundColor: "#F7F8FA", borderRadius: 12, padding: 16 }}>
      <Text style={{ fontSize: 12, color: "#6B7280", textTransform: "uppercase" }}>USDXM Balance</Text>
      <Text style={{ fontSize: 32, fontWeight: "600", marginVertical: 8 }}>${balance ?? "—"}</Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <TouchableOpacity
          style={{ backgroundColor: "#13b601", padding: 10, borderRadius: 8, flex: 1, alignItems: "center" }}
          onPress={handleFund}
        >
          <Text style={{ color: "#fff", fontWeight: "500" }}>Add Funds</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor: "#fff", padding: 10, borderRadius: 8, flex: 1, alignItems: "center", borderWidth: 1, borderColor: "#E5E7EB" }}
          onPress={refreshBalance}
        >
          <Text style={{ fontWeight: "500" }}>Refresh</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
