import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { productAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

const { width } = Dimensions.get("window");

export default function HomeScreen({ navigation }) {
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [featuredRes, trendingRes, categoriesRes] = await Promise.all([
        productAPI.getFeatured(),
        productAPI.getTrending(),
        productAPI.getCategories(),
      ]);
      setFeatured(featuredRes.data.products || []);
      setTrending(trendingRes.data.products || []);
      setCategories(categoriesRes.data.categories || []);
    } catch (error) {
      console.log("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const ProductCard = ({ product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() =>
        navigation.navigate("ProductDetail", { productId: product._id })
      }
    >
      <Image
        source={{ uri: product.images?.[0] || "https://picsum.photos/200/200" }}
        style={styles.productImage}
      />
      <Text style={styles.productName} numberOfLines={1}>
        {product.name}
      </Text>
      <Text style={styles.productPrice}>${product.price}</Text>
    </TouchableOpacity>
  );

  const CategoryCard = ({ category }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() =>
        navigation.navigate("ProductListing", { category: category.name })
      }
    >
      <Text style={styles.categoryIcon}>📁</Text>
      <Text style={styles.categoryName}>{category.name}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Login/Profile Button */}
      <View style={styles.header}>
        <Text style={styles.logo}>🛍️ ShopEase</Text>
        {!isAuthenticated ? (
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.loginBtnText}>Login</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => navigation.navigate("Profile")}
          >
            <Text style={styles.loginBtnText}>Profile</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Hero Banner */}
      <View style={styles.hero}>
        <Image
          source={{ uri: "https://picsum.photos/id/26/800/400" }}
          style={styles.heroImage}
        />
        <View style={styles.heroOverlay}>
          <Text style={styles.heroTitle}>Summer Sale!</Text>
          <Text style={styles.heroSubtitle}>Up to 50% Off</Text>
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => navigation.navigate("ProductListing")}
          >
            <Text style={styles.shopBtnText}>Shop Now →</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <FlatList
          horizontal
          data={categories}
          renderItem={({ item }) => <CategoryCard category={item} />}
          keyExtractor={(item) => item.name}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* Featured Products */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured Products</Text>
        <FlatList
          horizontal
          data={featured}
          renderItem={({ item }) => <ProductCard product={item} />}
          keyExtractor={(item) => item._id}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* Trending Products */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trending Now</Text>
        <FlatList
          horizontal
          data={trending}
          renderItem={({ item }) => <ProductCard product={item} />}
          keyExtractor={(item) => item._id}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
  },
  logo: { fontSize: 20, fontWeight: "bold", color: "#3b82f6" },
  loginBtn: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  loginBtnText: { color: "#fff", fontWeight: "bold" },
  hero: { height: 200, margin: 15, borderRadius: 15, overflow: "hidden" },
  heroImage: { width: "100%", height: "100%" },
  heroOverlay: { position: "absolute", bottom: 20, left: 20 },
  heroTitle: { fontSize: 28, fontWeight: "bold", color: "#fff" },
  heroSubtitle: { fontSize: 16, color: "#fff" },
  shopBtn: { marginTop: 10 },
  shopBtnText: { color: "#fff", fontWeight: "bold" },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 15,
    marginBottom: 10,
  },
  categoryCard: {
    width: 100,
    backgroundColor: "#fff",
    marginLeft: 15,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    elevation: 2,
  },
  categoryIcon: { fontSize: 30 },
  categoryName: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 5,
    textAlign: "center",
  },
  productCard: {
    width: 160,
    backgroundColor: "#fff",
    marginLeft: 15,
    padding: 10,
    borderRadius: 10,
    elevation: 2,
  },
  productImage: { width: 140, height: 140, borderRadius: 10 },
  productName: { fontSize: 14, fontWeight: "500", marginTop: 8 },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3b82f6",
    marginTop: 4,
  },
});
