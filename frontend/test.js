import React, { useState, useEffect } from "react";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import axios from "axios";

// ============ CONFIGURATION ============
// CHANGE THIS BASED ON YOUR SETUP:
// Android Emulator: http://10.0.2.2:5000/api
// iOS Emulator: http://localhost:5000/api
// Physical Phone: http://YOUR_COMPUTER_IP:5000/api
const API_URL = "http://192.168.1.11:5000/api";

// ============ MEMORY STORAGE ============
let memoryToken = null;
let memoryUser = null;

// ============ API FUNCTIONS ============
const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// Add token to all requests
api.interceptors.request.use(async (config) => {
  if (memoryToken) {
    config.headers["x-auth-token"] = memoryToken;
  }
  return config;
});

const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
};

const productAPI = {
  getAll: () => api.get("/products"),
};

const cartAPI = {
  get: () => api.get("/cart"),
  add: (productId, quantity) => api.post("/cart", { productId, quantity }),
  update: (productId, quantity) => api.put(`/cart/${productId}`, { quantity }),
  remove: (productId) => api.delete(`/cart/${productId}`),
};

const orderAPI = {
  create: (data) => api.post("/orders", data),
  get: () => api.get("/orders"),
};

// ============ HOME SCREEN ============
function HomeScreen({ navigation, isLoggedIn, cartCount }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [numColumns, setNumColumns] = useState(2);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await productAPI.getAll();
      if (response.data && response.data.products) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.log("Load error:", error);
      Alert.alert("Error", "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const ProductCard = ({ product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation("ProductDetail", { product })}
      activeOpacity={0.9}
    >
      <View style={styles.cardInner}>
        <Image
          source={{
            uri: product.images?.[0] || "https://picsum.photos/id/1/200/200",
          }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.productPrice}>${product.price}</Text>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>⭐ {product.rating || 4.5}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation("ProductDetail", { product })}
          >
            <Text style={styles.addBtnText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ marginTop: 10, color: "#666" }}>
          Loading products...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>🛍️ ShopEase</Text>
          <Text style={styles.tagline}>Best deals online</Text>
        </View>
        {!isLoggedIn ? (
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => navigation("Login")}
          >
            <Text style={styles.loginBtnText}>Login</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.cartHeaderBtn}
              onPress={() => navigation("Cart")}
            >
              <Text style={styles.cartHeaderText}>Cart</Text>
              {cartCount > 0 ? (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartCount}</Text>
                </View>
              ) : null}
            </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => navigation("Profile")}
          >
            <Text style={styles.loginBtnText}>👤 Profile</Text>
          </TouchableOpacity>
          </View>
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
            style={styles.shopNowBtn}
            onPress={() => navigation("ProductListing")}
          >
            <Text style={styles.shopNowText}>Shop Now →</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Products Grid */}
      <View style={styles.productsHeader}>
        <Text style={styles.sectionTitle}>All Products</Text>
        <Text style={styles.productCount}>{products.length} items</Text>
      </View>

      <FlatList
        data={products}
        renderItem={({ item }) => <ProductCard product={item} />}
        keyExtractor={(item) => item._id}
        numColumns={2}
        scrollEnabled={false}
        contentContainerStyle={styles.productGrid}
        columnWrapperStyle={styles.productRow}
      />
    </ScrollView>
  );
}
// ============ PRODUCT DETAIL SCREEN ============
function ProductDetailScreen({ product, onAddToCart, onBack }) {
  const [quantity, setQuantity] = useState(1);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f9fa", paddingHorizontal: 12 }}>
        <ScrollView style={styles.container}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backBtnText}>← Back to Home</Text>
          </TouchableOpacity>

          <Image
            source={{
              uri: product.images?.[0] || "https://picsum.photos/id/1/400/400",
            }}
            style={styles.detailImage}
          />

          <View style={styles.detailInfo}>
            <Text style={styles.detailName}>{product.name}</Text>
            <Text style={styles.detailPrice}>${product.price}</Text>
            <Text style={styles.detailRating}>⭐ {product.rating || 4.5} / 5</Text>
            <Text style={styles.detailCategory}>
              Category: {product.category || "General"}
            </Text>
            <Text style={styles.detailDescription}>
              {product.description || "No description available"}
            </Text>

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

            <TouchableOpacity
              style={styles.cartBtn}
              onPress={() => onAddToCart(product, quantity)}
            >
              <Text style={styles.cartBtnText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// ============ LOGIN SCREEN ============
function LoginScreen({ onLogin, onNavigate }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      if (res.data?.token) {
        memoryToken = res.data.token;
        memoryUser = res.data.user;
        onLogin(res.data.user);
      }
    } catch (error) {
      Alert.alert(
        "Login Failed",
        error.response?.data?.message || "Login failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f9fa", paddingHorizontal: 12 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.center}
        >
          <View style={styles.form}>
            <TouchableOpacity
              style={styles.authBackBtn}
              onPress={() => onNavigate("Home")}
            >
              <Text style={styles.authBackBtnText}>← Back to Home</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Login to your account</Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => onNavigate("Register")}>
              <Text style={styles.link}>Don't have an account? Sign Up</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// ============ REGISTER SCREEN ============
function RegisterScreen({ onRegister, onNavigate }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.register({ name, email, password });
      if (res.data?.token) {
        memoryToken = res.data.token;
        memoryUser = res.data.user;
        onRegister(res.data.user);
      }
    } catch (error) {
      Alert.alert(
        "Registration Failed",
        error.response?.data?.message || "Registration failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f9fa", paddingHorizontal: 12 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.center}
        >
          <View style={styles.form}>
            <TouchableOpacity
              style={styles.authBackBtn}
              onPress={() => onNavigate("Home")}
            >
              <Text style={styles.authBackBtnText}>← Back to Home</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>

            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Password (min 6)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => onNavigate("Login")}>
              <Text style={styles.link}>Already have an account? Login</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// ============ CART SCREEN ============
function CartScreen({ cart, onUpdateQuantity, onCheckout, onBack }) {
  const getCartProduct = (item) => item.product || {};
  const getProductId = (item) => {
    const product = getCartProduct(item);
    return product._id || product.id || item.productId || item._id;
  };

  const total = cart.reduce(
    (sum, item) => {
      const product = getCartProduct(item);
      return sum + (Number(product.price) || 0) * item.quantity;
    },
    0,
  );

  if (cart.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <TouchableOpacity style={styles.button} onPress={onBack}>
          <Text style={styles.buttonText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f9fa", paddingHorizontal: 12 }}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>

          <FlatList
            data={cart}
            renderItem={({ item }) => {
              const product = getCartProduct(item);
              const productId = getProductId(item);

              return (
              <View style={styles.cartItem}>
                <Image
                  source={{
                    uri:
                      product.images?.[0] ||
                      "https://picsum.photos/id/1/100/100",
                  }}
                  style={styles.cartImage}
                />
                <View style={styles.cartInfo}>
                  <Text style={styles.cartName}>
                    {product.name || "Cart item"}
                  </Text>
                  <Text style={styles.cartPrice}>
                    ${Number(product.price || 0).toFixed(2)}
                  </Text>
                  <View style={styles.cartQtyRow}>
                    <TouchableOpacity
                      onPress={() =>
                        onUpdateQuantity(productId, item.quantity - 1)
                      }
                      disabled={!productId}
                    >
                      <Text style={styles.qtyBtn}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.cartQty}>{item.quantity}</Text>
                    <TouchableOpacity
                      onPress={() =>
                        onUpdateQuantity(productId, item.quantity + 1)
                      }
                      disabled={!productId}
                    >
                      <Text style={styles.qtyBtn}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => onUpdateQuantity(productId, 0)}
                  disabled={!productId}
                >
                  <Text style={styles.removeBtn}>🗑️</Text>
                </TouchableOpacity>
              </View>
              );
            }}
            keyExtractor={(item, index) => getProductId(item) || String(index)}
          />

          <View style={styles.footer}>
            <Text style={styles.totalText}>Total: ${total.toFixed(2)}</Text>
            <TouchableOpacity style={styles.checkoutBtn} onPress={onCheckout}>
              <Text style={styles.checkoutText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// ============ CHECKOUT SCREEN ============
function CheckoutScreen({ total, onSubmit, onBack }) {
  const [form, setForm] = useState({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (
      !form.fullName ||
      !form.address ||
      !form.city ||
      !form.postalCode ||
      !form.phone
    ) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    setLoading(true);
    await onSubmit(form);
    setLoading(false);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f9fa", paddingHorizontal: 12 }}>
        <ScrollView style={styles.container}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backBtnText}>← Back to Cart</Text>
          </TouchableOpacity>

          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Shipping Information</Text>

            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={form.fullName}
              onChangeText={(text) => setForm({ ...form, fullName: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Address"
              value={form.address}
              onChangeText={(text) => setForm({ ...form, address: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="City"
              value={form.city}
              onChangeText={(text) => setForm({ ...form, city: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Postal Code"
              value={form.postalCode}
              onChangeText={(text) => setForm({ ...form, postalCode: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone"
              value={form.phone}
              onChangeText={(text) => setForm({ ...form, phone: text })}
              keyboardType="phone-pad"
            />

            <View style={styles.summaryBox}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              <Text style={styles.summaryText}>Subtotal: ${total.toFixed(2)}</Text>
              <Text style={styles.summaryText}>Shipping: $5.00</Text>
              <Text style={styles.summaryText}>
                Tax: ${(total * 0.1).toFixed(2)}
              </Text>
              <Text style={styles.summaryTotal}>
                Total: ${(total + 5 + total * 0.1).toFixed(2)}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Place Order</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// ============ PROFILE SCREEN ============
function ProfileScreen({ user, onLogout, onBack }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await orderAPI.get();
      setOrders(res.data.orders || []);
    } catch (error) {
      console.log("Fetch orders error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f9fa", paddingHorizontal: 12 }}>
        <ScrollView style={styles.container}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.profileHeader}>
            <Text style={styles.profileName}>{user?.name || "User"}</Text>
            <Text style={styles.profileEmail}>
              {user?.email || "user@example.com"}
            </Text>
          </View>

          <View style={styles.statsBox}>
            <Text style={styles.statsNumber}>{orders.length}</Text>
            <Text style={styles.statsLabel}>Total Orders</Text>
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// ============ MAIN APP ============
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState("Home");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [checkoutTotal, setCheckoutTotal] = useState(0);

  useEffect(() => {
    if (memoryUser) {
      setUser(memoryUser);
      setIsLoggedIn(true);
      loadCart();
    }
  }, []);

  const loadCart = async () => {
    try {
      const res = await cartAPI.get();
      setCart(res.data.cart?.items || []);
    } catch (error) {
      console.log("Load cart error:", error);
    }
  };

  const addToCart = async (product, quantity) => {
    if (!isLoggedIn) {
      Alert.alert("Login Required", "Please login to add items to cart", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => setCurrentScreen("Login") },
      ]);
      return;
    }
    try {
      await cartAPI.add(product._id, quantity);
      await loadCart();
      Alert.alert("Success", `${product.name} added to cart!`);
      setCurrentScreen("Cart");
    } catch (error) {
      Alert.alert("Error", "Failed to add to cart");
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      if (quantity < 1) {
        await cartAPI.remove(productId);
      } else {
        await cartAPI.update(productId, quantity);
      }
      await loadCart();
    } catch (error) {
      console.log("Update error:", error);
    }
  };

  const placeOrder = async (shippingAddress) => {
    try {
      await orderAPI.create({ shippingAddress });
      await loadCart();
      Alert.alert("Success", "Order placed successfully!", [
        { text: "OK", onPress: () => setCurrentScreen("Home") },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to place order");
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    setCurrentScreen("Home");
    loadCart();
  };

  const handleLogout = () => {
    memoryToken = null;
    memoryUser = null;
    setUser(null);
    setIsLoggedIn(false);
    setCart([]);
    setCurrentScreen("Home");
  };

  const navigate = (screen, params = {}) => {
    if (screen === "ProductDetail") {
      setSelectedProduct(params.product);
      setCurrentScreen("ProductDetail");
    } else if (screen === "Cart") {
      if (!isLoggedIn) {
        Alert.alert("Login Required", "Please login to view your cart", [
          { text: "Cancel", style: "cancel" },
          { text: "Login", onPress: () => setCurrentScreen("Login") },
        ]);
        return;
      }
      loadCart();
      setCurrentScreen("Cart");
    } else {
      setCurrentScreen(screen);
    }
  };

  // Screen rendering
  if (currentScreen === "Login") {
    return <LoginScreen onLogin={handleLogin} onNavigate={navigate} />;
  }

  if (currentScreen === "Register") {
    return <RegisterScreen onRegister={handleLogin} onNavigate={navigate} />;
  }

  if (currentScreen === "ProductDetail" && selectedProduct) {
    return (
      <ProductDetailScreen
        product={selectedProduct}
        onAddToCart={addToCart}
        onBack={() => setCurrentScreen("Home")}
      />
    );
  }

  if (currentScreen === "Cart") {
    return (
      <CartScreen
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onCheckout={() => {
          const total = cart.reduce(
            (sum, item) =>
              sum + (Number(item.product?.price) || 0) * item.quantity,
            0,
          );
          setCheckoutTotal(total);
          setCurrentScreen("Checkout");
        }}
        onBack={() => setCurrentScreen("Home")}
      />
    );
  }

  if (currentScreen === "Checkout") {
    return (
      <CheckoutScreen
        total={checkoutTotal}
        onSubmit={placeOrder}
        onBack={() => setCurrentScreen("Cart")}
      />
    );
  }

  if (currentScreen === "Profile" && isLoggedIn) {
    return (
      <ProfileScreen
        user={user}
        onLogout={handleLogout}
        onBack={() => setCurrentScreen("Home")}
      />
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f9fa", paddingHorizontal: 12 }}>
        <HomeScreen
          navigation={navigate}
          isLoggedIn={isLoggedIn}
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// ============ STYLES ============
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },

  // Header Styles
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  logo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#3b82f6",
  },
  tagline: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
  },
  loginBtn: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 1,
  },
  loginBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cartHeaderBtn: {
    minWidth: 52,
    minHeight: 36,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
  },
  cartHeaderText: {
    color: "#3b82f6",
    fontWeight: "600",
    fontSize: 14,
  },
  cartBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },

  // Hero Banner Styles
  hero: {
    height: 200,
    margin: 16,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginTop: 4,
  },
  shopNowBtn: {
    marginTop: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  shopNowText: {
    color: "#3b82f6",
    fontWeight: "bold",
    fontSize: 13,
  },

  // Products Header
  productsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },
  productCount: {
    fontSize: 13,
    color: "#6b7280",
  },

  // Product Grid - Mobile Friendly
  productGrid: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  productRow: {
    justifyContent: "space-between",
  },
  productCard: {
    flex: 1,
    backgroundColor: "#fff",
    margin: 6,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  cardInner: {
    flex: 1,
  },
  productImage: {
    width: "100%",
    height: 140,
    backgroundColor: "#f3f4f6",
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f2937",
    lineHeight: 18,
    marginBottom: 6,
    height: 36,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3b82f6",
  },
  ratingBadge: {
    backgroundColor: "#fbbf24",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#fff",
  },
  addBtn: {
    backgroundColor: "#3b82f6",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 4,
  },
  addBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  // Product Detail Styles
  detailImage: {
    width: "100%",
    height: 350,
    backgroundColor: "#f3f4f6",
  },
  detailInfo: {
    padding: 20,
  },
  detailName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  detailPrice: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#3b82f6",
    marginBottom: 8,
  },
  detailRating: {
    fontSize: 14,
    color: "#fbbf24",
    marginBottom: 8,
    fontWeight: "600",
  },
  detailCategory: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 12,
  },
  detailDescription: {
    fontSize: 15,
    color: "#4b5563",
    lineHeight: 22,
    marginBottom: 20,
  },

  // Quantity Selector
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  quantityLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
  },
  qtyBtn: {
    fontSize: 22,
    paddingHorizontal: 16,
    color: "#3b82f6",
    fontWeight: "bold",
  },
  quantity: {
    fontSize: 18,
    marginHorizontal: 12,
    fontWeight: "600",
    color: "#1f2937",
  },
  cartBtn: {
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  cartBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Back Button
  backBtn: {
    padding: 16,
    paddingBottom: 8,
  },
  backBtnText: {
    fontSize: 16,
    color: "#3b82f6",
    fontWeight: "500",
  },

  // Form Styles
  form: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#3b82f6",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  link: {
    color: "#3b82f6",
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
  },
  authBackBtn: {
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  authBackBtnText: {
    color: "#3b82f6",
    fontSize: 15,
    fontWeight: "500",
  },

  // Cart Styles
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    margin: 10,
    padding: 12,
    borderRadius: 12,
    elevation: 1,
  },
  cartImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
  },
  cartInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cartName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  cartPrice: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#3b82f6",
    marginTop: 4,
  },
  cartQtyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  cartQty: {
    fontSize: 16,
    marginHorizontal: 12,
    fontWeight: "500",
  },
  removeBtn: {
    fontSize: 22,
    padding: 8,
    color: "#ef4444",
  },

  // Footer
  footer: {
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  totalText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1f2937",
  },
  checkoutBtn: {
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  checkoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Profile Styles
  profileHeader: {
    backgroundColor: "#3b82f6",
    padding: 40,
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: "#e0e7ff",
  },
  logoutBtn: {
    margin: 20,
    padding: 16,
    backgroundColor: "#ef4444",
    borderRadius: 12,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Empty States
  emptyText: {
    fontSize: 18,
    color: "#6b7280",
    marginBottom: 20,
    textAlign: "center",
  },
});
