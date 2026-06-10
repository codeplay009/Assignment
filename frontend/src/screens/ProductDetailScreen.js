import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { productAPI, cartAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    try {
      const res = await productAPI.getById(productId);
      setProduct(res.data.product);
    } catch (error) {
      console.log("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    if (!isAuthenticated) {
      Alert.alert("Login Required", "Please login to add items to cart", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => navigation.navigate("Login") },
      ]);
      return;
    }

    try {
      await cartAPI.add(productId, quantity);
      Alert.alert("Success", `${product.name} added to cart!`);
    } catch (error) {
      Alert.alert("Error", "Failed to add to cart");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{
          uri: product?.images?.[0] || "https://picsum.photos/400/400",
        }}
        style={styles.image}
      />

      <View style={styles.info}>
        <Text style={styles.name}>{product?.name}</Text>
        <Text style={styles.price}>${product?.price}</Text>
        <Text style={styles.category}>Category: {product?.category}</Text>
        <Text style={styles.description}>{product?.description}</Text>

        <View style={styles.quantityRow}>
          <Text style={styles.quantityLabel}>Quantity:</Text>
          <TouchableOpacity
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Text style={styles.qtyBtn}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantity}>{quantity}</Text>
          <TouchableOpacity onPress={() => setQuantity(quantity + 1)}>
            <Text style={styles.qtyBtn}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.cartBtn} onPress={addToCart}>
          <Text style={styles.cartBtnText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  image: { width: "100%", height: 400 },
  info: { padding: 20 },
  name: { fontSize: 24, fontWeight: "bold" },
  price: { fontSize: 28, fontWeight: "bold", color: "#3b82f6", marginTop: 10 },
  category: { fontSize: 14, color: "#666", marginTop: 8 },
  description: { fontSize: 16, color: "#333", marginTop: 15, lineHeight: 24 },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  quantityLabel: { flex: 1, fontSize: 16 },
  qtyBtn: { fontSize: 20, paddingHorizontal: 15, color: "#3b82f6" },
  quantity: { fontSize: 18, marginHorizontal: 10 },
  cartBtn: {
    backgroundColor: "#3b82f6",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  cartBtnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
