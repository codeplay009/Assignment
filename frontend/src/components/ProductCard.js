import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

export default function ProductCard({ product, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image
        source={{ uri: product.images?.[0] || "https://picsum.photos/150/150" }}
        style={styles.image}
      />
      <Text style={styles.name} numberOfLines={1}>
        {product.name}
      </Text>
      <Text style={styles.price}>${product.price}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: "#fff",
    margin: "1%",
    padding: 10,
    borderRadius: 10,
    elevation: 2,
  },
  image: { width: "100%", height: 150, borderRadius: 10 },
  name: { fontSize: 14, fontWeight: "500", marginTop: 8 },
  price: { fontSize: 16, fontWeight: "bold", color: "#3b82f6", marginTop: 4 },
});
