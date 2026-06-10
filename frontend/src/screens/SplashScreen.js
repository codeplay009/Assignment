import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace("Home");
    }, 2000);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoCircle}>
        <Text style={styles.logoText}>🛍️</Text>
      </View>
      <Text style={styles.appName}>ShopEase</Text>
      <Text style={styles.tagline}>Your One-Stop Shopping Destination</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logoText: { fontSize: 60 },
  appName: { fontSize: 32, fontWeight: "bold", color: "#fff", marginBottom: 8 },
  tagline: { fontSize: 16, color: "#fff", opacity: 0.9 },
});
