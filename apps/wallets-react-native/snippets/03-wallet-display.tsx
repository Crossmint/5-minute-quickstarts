import { View, Text } from "react-native";
import { useWallet } from "@crossmint/client-sdk-react-native-ui";

export function WalletDisplay() {
  const { wallet, status } = useWallet();

  if (status === "in-progress") {
    return <Text style={{ color: "#6B7280" }}>Creating wallet...</Text>;
  }

  if (!wallet) {
    return <Text style={{ color: "#6B7280" }}>No wallet connected</Text>;
  }

  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ color: "#6B7280" }}>Address</Text>
        <Text style={{ fontWeight: "500" }}>{wallet.address}</Text>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ color: "#6B7280" }}>Chain</Text>
        <Text style={{ fontWeight: "500" }}>{wallet.chain}</Text>
      </View>
    </View>
  );
}
