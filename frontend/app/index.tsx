import { Redirect } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useAuth } from "@/src/auth";
import { colors } from "@/src/theme";

export default function Index() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.center} testID="boot-loading">
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    );
  }

  return <Redirect href={token ? "/(tabs)" : "/(auth)/login"} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface },
});
