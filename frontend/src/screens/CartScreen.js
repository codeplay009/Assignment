import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { cartAPI } from "../services/api";

export default function CartScreen({ navigation }) {
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
    const unsubscribe = navigation.addListener("focus", fetchCart);
    return unsubscribe;
  }, [navigation]);

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

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) {
      await cartAPI.remove(productId);
    } else {
      await cartAPI.update(productId, quantity);
    }
    fetchCart();
  };

  const CartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image
        source={{ uri: item.product.images?.[0] }}
        style={styles.itemImage}
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.product.name}</Text>
        <Text style={styles.itemPrice}>${item.product.price}</Text>
        <View style={styles.qtyRow}>
          <TouchableOpacity
            onPress={() => updateQuantity(item.product._id, item.quantity - 1)}
          >
            <Text style={styles.qtyBtn}>-</Text>
          </TouchableOpacity>
          <Text style={styles.qty}>{item.quantity}</Text>
          <TouchableOpacity
            onPress={() => updateQuantity(item.product._id, item.quantity + 1)}
          >
            <Text style={styles.qtyBtn}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity onPress={() => updateQuantity(item.product._id, 0)}>
        <Text style={styles.remove}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (cart.items?.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Your cart is empty</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cart.items}
        renderItem={({ item }) => <CartItem item={item} />}
        keyExtractor={(item) => item.product._id}
      />
      <View style={styles.footer}>
        <Text style={styles.total}>Total: ${cart.totalPrice?.toFixed(2)}</Text>
        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => navigation.navigate("Checkout")}
        >
          <Text style={styles.checkoutText}>Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    margin: 10,
    padding: 15,
    borderRadius: 10,
  },
  itemImage: { width: 80, height: 80, borderRadius: 10 },
  itemInfo: { flex: 1, marginLeft: 15 },
  itemName: { fontSize: 16, fontWeight: "bold" },
  itemPrice: { fontSize: 14, color: "#3b82f6", marginTop: 4 },
  qtyRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  qtyBtn: { fontSize: 20, paddingHorizontal: 15, color: "#3b82f6" },
  qty: { fontSize: 16, marginHorizontal: 10 },
  remove: { fontSize: 20, padding: 10 },
  footer: {
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  total: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  checkoutBtn: {
    backgroundColor: "#3b82f6",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  checkoutText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  emptyText: { fontSize: 18, color: "#666" },
});
