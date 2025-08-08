import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { FavoriteProvider } from "./context/FavoriteContext";
import { ToastProvider } from "./context/ToastContext";
import ToastContainer from "./components/ToastContainer";
import Navigation from "./pages/Auth/Navigation";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import OTPVerification from "./components/OTPVerification";
import ProductForm from "./ProductForm";
import ProductManagement from "./pages/Admin/ProductManagement";
import ProductFormPage from "./pages/Admin/ProductFormPage";
import CategoryManagement from "./pages/Admin/CategoryManagement";
import FavoritePage from "./pages/Favorite/Favorite";
import Cart from "./pages/Cart";
import Shipping from "./pages/Orders/ShippingClone";
import PlaceOrder from "./pages/Orders/PlaceOrderClone";
import Order from "./pages/Orders/OrderClone";
import OrderConfirmation from "./pages/Orders/OrderConfirmation";
import AdminOrderManagement from "./pages/Admin/AdminOrderManagement";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Profile from "./pages/User/ProfileClone";
import UserOrderClone from "./pages/Orders/UserOrderClone";
import VRMViewer from "./pages/VRMViewer";
import UserList from "./pages/Admin/UserList";
import ProductUpdate from "./pages/Admin/ProductUpdate";
import ProductCreate from "./pages/Admin/ProductCreate";
import Test from "./pages/Test/Test";
function UserManagement() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Quản lý người dùng</h1>
      <p>Danh sách user (Phase 9)</p>
    </div>
  );
}

function NotFound() {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>404</h1>
      <p>Trang không tồn tại!</p>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <FavoriteProvider>
          <ToastProvider>
            <BrowserRouter>
              <ToastContainer />

              <Navigation />
              <main className="py-3">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/otp" element={<OTPVerification />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/favorites" element={<FavoritePage />} />
                  <Route path="/vrm" element={<VRMViewer />} />
                  <Route path="/test" element={<Test />} />
                  <Route element={<ProtectedRoute />}>
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/shipping" element={<Shipping />} />
                    <Route path="/place-order" element={<PlaceOrder />} />
                    <Route path="/order/:id" element={<Order />} />
                    <Route path="/orders/:id" element={<Order />} />{" "}
                    <Route
                      path="/order-confirmation/:id"
                      element={<OrderConfirmation />}
                    />
                    <Route path="/favorite" element={<FavoritePage />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/orders" element={<UserOrderClone />} />
                    <Route path="/add" element={<ProductForm />} />
                  </Route>
                  <Route element={<AdminRoute />}>
                    <Route
                      path="/admin/dashboard"
                      element={<AdminDashboard />}
                    />
                    <Route
                      path="/admin/products"
                      element={<ProductManagement />}
                    />
                    <Route
                      path="/admin/products/create"
                      element={<ProductCreate />}
                    />
                    <Route
                      path="/admin/products/edit/:id"
                      element={<ProductFormPage />}
                    />
                    <Route
                      path="/admin/products/update/:id"
                      element={<ProductUpdate />}
                    />
                    <Route
                      path="/admin/categories"
                      element={<CategoryManagement />}
                    />
                    <Route
                      path="/admin/orders"
                      element={<AdminOrderManagement />}
                    />
                    <Route path="/admin/users" element={<UserList />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </BrowserRouter>
          </ToastProvider>
        </FavoriteProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
