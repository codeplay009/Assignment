import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ClearStorageScreen({ navigation }) {
  const clearAllData = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      Alert.alert("Success", "Storage cleared!", [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ]);
    } catch (error) {
      console.log("Clear error:", error);
      Alert.alert("Error", "Failed to clear storage");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Clear Saved Data</Text>
      <Text style={styles.subtitle}>
        You are automatically logged in. Click below to clear saved login data.
      </Text>

      <TouchableOpacity style={styles.clearButton} onPress={clearAllData}>
        <Text style={styles.clearButtonText}>Clear All Data</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.skipButtonText}>Skip - Go to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10, color: "#333" },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  clearButton: {
    backgroundColor: "#ef4444",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    marginBottom: 10,
  },
  clearButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  skipButton: {
    backgroundColor: "#9ca3af",
    padding: 15,
    borderRadius: 10,
    width: "100%",
  },
  skipButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});
