import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { cartAPI, orderAPI } from "../services/api";

export default function CheckoutScreen({ navigation }) {
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await cartAPI.get();
      setCart(res.data.cart);
    } catch (error) {
      console.log("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.fullName) newErrors.fullName = "Full name is required";
    if (!form.address) newErrors.address = "Address is required";
    if (!form.city) newErrors.city = "City is required";
    if (!form.postalCode) newErrors.postalCode = "Postal code is required";
    if (!form.phone) newErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(form.phone))
      newErrors.phone = "Phone must be 10 digits";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const placeOrder = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await orderAPI.create({ shippingAddress: form });
      Alert.alert("Success", "Order placed successfully!", [
        { text: "OK", onPress: () => navigation.navigate("Home") },
      ]);
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to place order",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Shipping Information</Text>

        <TextInput
          style={[styles.input, errors.fullName && styles.inputError]}
          placeholder="Full Name"
          value={form.fullName}
          onChangeText={(text) => setForm({ ...form, fullName: text })}
        />
        {errors.fullName && (
          <Text style={styles.errorText}>{errors.fullName}</Text>
        )}

        <TextInput
          style={[styles.input, errors.address && styles.inputError]}
          placeholder="Address"
          value={form.address}
          onChangeText={(text) => setForm({ ...form, address: text })}
        />
        {errors.address && (
          <Text style={styles.errorText}>{errors.address}</Text>
        )}

        <TextInput
          style={[styles.input, errors.city && styles.inputError]}
          placeholder="City"
          value={form.city}
          onChangeText={(text) => setForm({ ...form, city: text })}
        />
        {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}

        <TextInput
          style={[styles.input, errors.postalCode && styles.inputError]}
          placeholder="Postal Code"
          value={form.postalCode}
          onChangeText={(text) => setForm({ ...form, postalCode: text })}
        />
        {errors.postalCode && (
          <Text style={styles.errorText}>{errors.postalCode}</Text>
        )}

        <TextInput
          style={[styles.input, errors.phone && styles.inputError]}
          placeholder="Phone Number"
          value={form.phone}
          onChangeText={(text) => setForm({ ...form, phone: text })}
          keyboardType="phone-pad"
        />
        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Payment Summary</Text>
          <Text style={styles.summaryText}>
            Subtotal: ${cart.totalPrice?.toFixed(2)}
          </Text>
          <Text style={styles.summaryText}>Shipping: $5.00</Text>
          <Text style={styles.summaryText}>
            Tax: ${(cart.totalPrice * 0.1).toFixed(2)}
          </Text>
          <Text style={styles.summaryTotal}>
            Total: ${(cart.totalPrice + 5 + cart.totalPrice * 0.1).toFixed(2)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={placeOrder}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Place Order</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  formContainer: { padding: 20 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  inputError: { borderColor: "#ef4444" },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5,
  },
  summary: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginVertical: 20,
  },
  summaryTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  summaryText: { fontSize: 14, color: "#666", marginBottom: 5 },
  summaryTotal: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3b82f6",
    marginTop: 10,
  },
  button: {
    backgroundColor: "#3b82f6",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
