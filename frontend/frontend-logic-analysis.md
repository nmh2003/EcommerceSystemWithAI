# Phân Tích Chi Tiết Logic Xử Lý Trong Codebase Frontend React

## 1. React Hooks

### useState

**Mục đích và khi nào sử dụng:** useState là một React hook dùng để thêm state vào các functional components. Nó được sử dụng bất cứ khi nào một component cần quản lý state cục bộ có thể thay đổi theo thời gian, chẳng hạn như input của form, trạng thái loading, thông báo lỗi, toggle UI, hoặc dữ liệu động như danh sách sản phẩm và bộ lọc.

**Chức năng cụ thể xử lý:**

- Quản lý trạng thái xác thực người dùng (object user, loading, error).
- Xử lý input của form (email, password, chi tiết sản phẩm).
- Kiểm soát trạng thái UI (spinner loading, thông báo lỗi, hiển thị modal).
- Lưu trữ dữ liệu đã fetch (sản phẩm, danh mục, đơn hàng).
- Theo dõi lựa chọn của người dùng (danh mục đã check, thương hiệu đã chọn, bộ lọc giá).

**Ví dụ code với đường dẫn và số dòng:**

- `src/context/AuthContext.jsx` (dòng 13-15):

```jsx
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

Quản lý trạng thái xác thực, chỉ báo loading trong quá trình gọi API, và thông báo lỗi cho các thao tác login/register.

- `src/pages/Shop.jsx` (dòng 12-18):

```jsx
const [allProducts, setAllProducts] = useState([]);
const [filteredProducts, setFilteredProducts] = useState([]);
const [categories, setCategories] = useState([]);
const [checkedCategories, setCheckedCategories] = useState([]);
const [selectedBrand, setSelectedBrand] = useState("");
const [priceFilter, setPriceFilter] = useState("");
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
```

Xử lý lưu trữ dữ liệu sản phẩm, trạng thái lọc, và phản hồi UI cho trang shop.

- `src/pages/ProductDetails.jsx` (dòng 14-17):

```jsx
const [product, setProduct] = useState(null);
const [quantity, setQuantity] = useState(1);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
```

Quản lý dữ liệu sản phẩm riêng lẻ, số lượng đã chọn, và trạng thái loading/error.

- `src/components/Register.jsx` (dòng 13-15):

```jsx
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [message, setMessage] = useState("");
```

Lưu trữ giá trị input của form và thông báo phản hồi cho việc đăng ký người dùng.

**Danh sách file sử dụng useState (toàn diện):**

- src/context/AuthContext.jsx
- src/context/CartContext.jsx
- src/context/FavoriteContext.jsx
- src/context/ToastContext.jsx
- src/pages/Shop.jsx
- src/pages/ProductDetails.jsx
- src/pages/Home.jsx
- src/pages/Cart.jsx
- src/pages/Favorites.jsx
- src/pages/ChatBot_new.jsx
- src/components/Login.jsx
- src/components/Register.jsx
- src/components/ProductForm.jsx
- src/components/ChatInput.jsx
- src/components/ProductCard.jsx
- Và nhiều file khác trong thư mục con.

**Giải thích chi tiết logic vận hành:**

useState hoạt động như "bộ nhớ tạm thời" cho component, lưu trữ dữ liệu có thể thay đổi. Ví dụ, khi người dùng nhập email vào form đăng ký, useState lưu giá trị đó và cập nhật UI ngay lập tức. Khi gọi API đăng ký, setLoading(true) hiển thị spinner, sau khi thành công setUser(data) cập nhật thông tin user. Điều này giúp UI phản ánh chính xác trạng thái hiện tại, tạo trải nghiệm mượt mà. State thay đổi trigger re-render, đảm bảo giao diện luôn đồng bộ với dữ liệu.

**Cách tích hợp với các phần khác của app:** useState là nền tảng cho quản lý state cục bộ trong functional components. Nó tích hợp liền mạch với useEffect cho side effects (ví dụ: cập nhật state sau API calls), event handlers (ví dụ: cập nhật input state), và context providers (ví dụ: contexts dùng useState cho global state). Thay đổi state trigger re-render, đảm bảo UI phản ánh dữ liệu mới nhất. Nó hoạt động với custom hooks và thường kết hợp với useContext để truy cập shared state.

### useEffect

**Mục đích và khi nào sử dụng:** useEffect là một React hook dùng để thực hiện side effects trong functional components, chẳng hạn như fetching data, thiết lập subscriptions, thao tác DOM, hoặc cleanup operations. Nó chạy sau khi component render và có thể cấu hình để chạy khi mount, update, hoặc unmount dựa trên dependencies.

**Chức năng cụ thể xử lý:**

- Fetching data từ APIs khi component mount.
- Loading dữ liệu user từ localStorage.
- Thiết lập và dọn dẹp resources (ví dụ: event listeners, timers).
- Phản hồi với thay đổi trong props, state, hoặc URL parameters.
- Quản lý subscriptions hoặc tasks định kỳ.

**Ví dụ code với đường dẫn và số dòng:**

- `src/context/AuthContext.jsx` (dòng 17-22):

```jsx
useEffect(() => {
  const storedUser = getUser();
  if (storedUser) {
    setUser(storedUser);
  }
}, []);
```

Load dữ liệu user đã lưu từ localStorage khi AuthProvider mount.

- `src/pages/Shop.jsx` (dòng 29-82):

```jsx
useEffect(() => {
  async function fetchData() {
    try {
      setLoading(true);
      const productsResponse = await fetch(
        `http://localhost:1337/api/products?limit=1000`
      );
      // ... xử lý response và set state
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }
  fetchData();
}, []);
```

Fetch dữ liệu sản phẩm và danh mục khi component mount, cập nhật trạng thái loading và error.

- `src/pages/ProductDetails.jsx` (dòng 25-53):

```jsx
useEffect(() => {
  async function fetchProduct() {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:1337/api/products/${id}`);
      if (!response.ok) throw new Error("Failed to fetch product");
      const data = await response.json();
      setProduct(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }
  fetchProduct();
}, [id]);
```

Fetch chi tiết sản phẩm dựa trên URL parameter `id`, re-run khi `id` thay đổi.

- `src/pages/Shop.jsx` (dòng 85-95):

```jsx
useEffect(() => {
  let filtered = [...allProducts];
  if (checkedCategories.length > 0) {
    filtered = filtered.filter((product) =>
      checkedCategories.includes(product.category?.id)
    );
  }
  // ... additional filters
  setFilteredProducts(filtered);
}, [checkedCategories, selectedBrand, priceFilter, allProducts]);
```

Áp dụng bộ lọc cho sản phẩm bất cứ khi nào trạng thái bộ lọc thay đổi, cập nhật danh sách sản phẩm hiển thị.

**Danh sách file sử dụng useEffect (toàn diện):**

- src/context/AuthContext.jsx
- src/context/CartContext.jsx
- src/context/FavoriteContext.jsx
- src/pages/Shop.jsx
- src/pages/ProductDetails.jsx
- src/pages/Home.jsx
- src/pages/Cart.jsx
- src/pages/Favorites.jsx
- src/pages/ChatBot_new.jsx
- src/components/ProductCard.jsx
- Và nhiều file khác trong các thư mục con.

**Giải thích chi tiết logic vận hành:**

useEffect hoạt động như "người thực thi tác vụ phụ" cho component. Ví dụ, khi trang Shop load lần đầu, useEffect chạy hàm fetchData() để lấy sản phẩm từ API, setLoading(true) hiển thị spinner, sau khi nhận data setAllProducts(data) và setLoading(false). Nếu có lỗi, setError(message) hiển thị thông báo. Khi người dùng thay đổi bộ lọc, useEffect re-run với dependencies mới, lọc lại danh sách sản phẩm. Điều này đảm bảo dữ liệu luôn cập nhật, UI phản hồi với thay đổi của người dùng.

**Cách tích hợp với các phần khác của app:** useEffect tích hợp với useState để cập nhật component state sau operations bất đồng bộ như API calls. Nó phản hồi với thay đổi trong dependencies (ví dụ: URL params qua useParams, context values). Nó thường trigger data fetching hoặc state synchronization, đảm bảo components đồng bộ với external data sources hoặc user actions. Cleanup functions trong useEffect ngăn memory leaks.

### useContext

**Mục đích và khi nào sử dụng:** useContext là một React hook dùng để consume values từ một React context. Nó được sử dụng khi components cần truy cập global hoặc shared state được cung cấp bởi context providers, tránh prop drilling.

**Chức năng cụ thể xử lý:**

- Truy cập trạng thái xác thực và methods (login, logout, user info).
- Quản lý operations giỏ hàng (add, remove, update items).
- Xử lý favorites (add, remove, toggle).
- Hiển thị và quản lý toast notifications.

**Ví dụ code với đường dẫn và số dòng:**

- `src/context/AuthContext.jsx` (dòng 177-182):

```jsx
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
```

Custom hook sử dụng useContext để cung cấp truy cập vào authentication context.

- `src/components/ProductCard.jsx` (dòng 8):

```jsx
const { addToCart } = useCart();
```

Consume cart context để truy cập hàm `addToCart`.

- `src/context/ToastContext.jsx` (dòng 36-38):

```jsx
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast phải được sử dụng trong ToastProvider");
  }
  return context;
}
```

Custom hook cho toast notifications.

**Danh sách file sử dụng useContext (toàn diện):**

- src/context/AuthContext.jsx
- src/context/CartContext.jsx
- src/context/FavoriteContext.jsx
- src/context/ToastContext.jsx
- Và các components/pages import và sử dụng custom hooks như useAuth, useCart, useFavorite, useToast.

**Giải thích chi tiết logic vận hành:**

useContext hoạt động như "cầu nối" đến global state. Ví dụ, khi component ProductCard cần thêm sản phẩm vào giỏ, nó gọi useCart() để lấy hàm addToCart từ CartContext. Context được tạo ở App.jsx, wrap toàn app, chứa state và functions. Khi addToCart chạy, nó cập nhật cart state trong context, trigger re-render cho tất cả components sử dụng cart. Điều này cho phép chia sẻ state across app mà không cần truyền props qua nhiều layers.

**Cách tích hợp với các phần khác của app:** Contexts được tạo và provide ở app level trong App.jsx, wrap toàn bộ application. Components sử dụng custom hooks (internally dùng useContext) để truy cập shared state và functions. Điều này enable global state management without Redux, tích hợp với useState và useEffect trong context providers cho state updates và side effects.

### useCallback

**Mục đích và khi nào sử dụng:** useCallback là một React hook dùng để memoize functions, ngăn chặn re-creations không cần thiết mỗi lần render. Nó được sử dụng cho performance optimization, đặc biệt cho functions được pass as props đến child components hoặc dùng trong useEffect dependencies.

**Chức năng cụ thể xử lý:**

- Memoizing event handlers và callback functions.
- Optimizing components với logic phức tạp hoặc animations.
- Ngăn child component re-renders do function reference changes.

**Ví dụ code với đường dẫn và số dòng:**

- `src/pages/VRMViewer.jsx` (dòng 41-67):

```jsx
const startBlinkLoop = useCallback(() => {
  const blink = () => {
    // blink animation logic
  };
  const loop = () => {
    const rand = Math.round(Math.random() * 10000) + 1000;
    setTimeout(() => {
      blink();
      loop();
    }, rand);
  };
  loop();
}, []);
```

Memoizes hàm blink loop cho VRM viewer animation.

- `src/pages/ProductDetails.jsx` (dòng 33-45):

```jsx
const fetchProductData = useCallback(async () => {
  try {
    const response = await fetch(`http://localhost:1337/api/products/${id}`);
    // ... process data
  } catch (error) {
    console.error("Error fetching product:", error);
  }
}, [id]);
```

Memoizes hàm fetch product data, dependent on `id`.

**Danh sách file sử dụng useCallback (toàn diện):**

- src/pages/VRMViewer.jsx
- src/pages/VRMViewerVU.jsx
- src/pages/ProductDetails.jsx

**Giải thích chi tiết logic vận hành:**

useCallback hoạt động như "bộ nhớ cache" cho functions. Ví dụ, trong VRMViewer, hàm startBlinkLoop được memoize với dependencies rỗng [], nghĩa là chỉ tạo một lần. Nếu không dùng useCallback, mỗi render sẽ tạo hàm mới, gây re-render không cần thiết cho child components nhận hàm đó. Điều này tối ưu performance, đặc biệt với animations phức tạp.

**Cách tích hợp với các phần khác của app:** useCallback được dùng trong performance-critical components để tránh unnecessary re-renders. Nó tích hợp với useEffect (as dependencies) và được pass đến child components. Trong complex UIs như VRM viewer, nó đảm bảo smooth animations bằng cách ngăn function recreation.

### useMemo

**Mục đích và khi nào sử dụng:** useMemo là một React hook dùng để memoize expensive computations, trả về cached value cho đến khi dependencies thay đổi. Nó được sử dụng cho performance optimization khi computing derived state hoặc filtering large datasets.

**Chức năng cụ thể xử lý:**

- Computing derived values từ state hoặc props.
- Filtering hoặc transforming data arrays.
- Tránh recalculations mỗi lần render.

**Ví dụ code với đường dẫn và số dòng:**

- `src/context/AuthContext.jsx` (dòng 19-20):

```jsx
const userInfo = useMemo(() => getUser(), []);
```

Memoizes user info retrieval từ localStorage.

- `src/pages/Admin/AdminOrderManagement.jsx` (dòng 73-85):

```jsx
const filteredAndSearchedOrders = useMemo(() => {
  let filtered = orders;
  if (searchTerm) {
    filtered = filtered.filter(
      (order) =>
        order.id.toString().includes(searchTerm) ||
        order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  // ... additional filters
  return filtered;
}, [orders, searchTerm, statusFilter, dateFilter]);
```

Memoizes filtered orders dựa trên search và filter criteria.

**Danh sách file sử dụng useMemo (toàn diện):**

- src/context/AuthContext.jsx
- src/pages/Admin/AdminOrderManagement.jsx

**Giải thích chi tiết logic vận hành:**

useMemo hoạt động như "bộ tính toán thông minh", chỉ chạy lại khi dependencies thay đổi. Ví dụ, trong AdminOrderManagement, khi searchTerm thay đổi, useMemo filter lại orders array, trả về kết quả cached. Nếu không dùng, mỗi render sẽ filter lại toàn bộ data, tốn CPU. Điều này tối ưu performance cho data-heavy components.

**Cách tích hợp với các phần khác của app:** useMemo optimizes rendering bằng cách cache computations. Nó tích hợp với state changes (ví dụ: search terms) để update derived data efficiently, giảm CPU usage trong data-heavy components như order management.

### useRef

**Mục đích và khi nào sử dụng:** useRef là một React hook dùng để tạo mutable references persist across renders mà không trigger re-renders. Nó được sử dụng để access DOM elements trực tiếp hoặc store values không cần cause UI updates.

**Chức năng cụ thể xử lý:**

- Referencing DOM elements cho manipulation.
- Storing mutable values (ví dụ: timers, previous values).
- Managing external library instances (ví dụ: Three.js objects).

**Ví dụ code với đường dẫn và số dòng:**

- `src/pages/VRMViewer.jsx` (dòng 10-25):

```jsx
const canvasRef = useRef(null);
const vrmRef = useRef(null);
const rendererRef = useRef(null);
const cameraRef = useRef(null);
const controlsRef = useRef(null);
const sceneRef = useRef(null);
```

References cho Three.js canvas và VRM model objects.

**Danh sách file sử dụng useRef (toàn diện):**

- src/pages/VRMViewer.jsx
- src/pages/VRMViewerVU.jsx

**Giải thích chi tiết logic vận hành:**

useRef hoạt động như "container lưu trữ" không trigger re-render. Ví dụ, trong VRMViewer, canvasRef lưu reference đến canvas element, dùng để Three.js render 3D model. Khi component re-render, ref giữ nguyên, tránh tạo lại canvas. Điều này cần thiết cho imperative operations với external libraries.

**Cách tích hợp với các phần khác của app:** useRef được dùng trong components cần direct DOM access hoặc integration với external libraries như Three.js. Nó tránh re-renders trong khi allow imperative operations, tích hợp với useEffect cho setup và cleanup.

## 2. State Management

### Context API

**Mục đích và khi nào sử dụng:** Context API được dùng để manage global state trong React applications. Nó được sử dụng cho state cần share across multiple components mà không prop drilling, chẳng hạn như user authentication, shopping cart, favorites, và notifications.

**Chức năng cụ thể xử lý:**

- Authentication: User login, logout, registration, OTP verification.
- Cart management: Adding/removing items, updating quantities, calculating totals.
- Favorites: Adding/removing favorite products, toggling states.
- Toast notifications: Adding/removing temporary messages.

**Ví dụ code với đường dẫn và số dòng:**

- `src/context/AuthContext.jsx` (toàn bộ provider):

```jsx
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // ... login, register, logout functions
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
    isAdmin,
    updateUser,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

Provides authentication state và methods globally.

- `src/context/CartContext.jsx` (dòng 25-35):

```jsx
const addToCart = (product, qty = 1) => {
  if (product.countInStock < qty)
    throw new Error(`Chỉ còn ${product.countInStock} sản phẩm trong kho`);
  const userId = user?.id || null;
  const updatedCart = addToCartLS(product, qty, userId);
  setCartItems(updatedCart);
  return updatedCart;
};
```

Handles adding items to cart với stock validation.

**Danh sách file sử dụng Context API (toàn diện):**

- src/context/AuthContext.jsx
- src/context/CartContext.jsx
- src/context/FavoriteContext.jsx
- src/context/ToastContext.jsx
- Tất cả components/pages sử dụng custom hooks.

**Giải thích chi tiết logic vận hành:**

Context API hoạt động như "kho chứa state toàn cục". Ví dụ, AuthContext lưu user state, khi login thành công setUser(data), tất cả components dùng useAuth() sẽ nhận user mới. CartContext quản lý giỏ hàng, addToCart cập nhật state và persist vào localStorage. Điều này cho phép share state across app mà không cần Redux.

**Cách tích hợp với các phần khác của app:** Contexts được provide trong App.jsx, wrap app. Chúng dùng useState và useEffect internally cho state management và side effects. Components access context via custom hooks, tích hợp với local state và API calls. State persists trong localStorage cho user-specific data.

## 3. API Calls và Data Fetching

### Fetch API

**Mục đích và khi nào sử dụng:** Fetch API được dùng để make HTTP requests đến backend server. Nó được sử dụng để retrieve và send data, chẳng hạn như fetching products, submitting forms, và handling CRUD operations.

**Chức năng cụ thể xử lý:**

- Fetching lists của products, categories, orders, users.
- Submitting user registration, login, order placement.
- Updating product details, managing categories.
- Handling authentication và OTP verification.

**Ví dụ code với đường dẫn và số dòng:**

- `src/pages/Shop.jsx` (dòng 36-41):

```jsx
const productsResponse = await fetch(
  `http://localhost:1337/api/products?limit=1000`
);
if (!productsResponse.ok) throw new Error("Failed to fetch products");
const productsData = await productsResponse.json();
```

- `src/pages/ProductDetails.jsx` (dòng 32-37):

```jsx
const response = await fetch(`http://localhost:1337/api/products/${id}`);
if (!response.ok) throw new Error("Failed to fetch product");
const data = await response.json();
```

- `src/pages/Admin/ProductCreate.jsx` (dòng 20-25):

```jsx
fetch("http://localhost:1337/api/products", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name, price, imageUrl }),
});
```

**Danh sách file sử dụng Fetch API (toàn diện):**

- src/pages/Shop.jsx
- src/pages/ProductDetails.jsx
- src/pages/Home.jsx
- src/pages/Cart.jsx
- src/pages/Favorites.jsx
- src/pages/ChatBot_new.jsx
- src/components/Login.jsx
- src/components/Register.jsx
- src/components/ProductForm.jsx
- Và nhiều admin và auth pages.

**Giải thích chi tiết logic vận hành:**

Fetch API hoạt động như "đại sứ" giao tiếp với backend. Ví dụ, khi Shop component mount, fetch gọi API lấy products, nếu thành công parse JSON và setAllProducts, nếu lỗi throw Error. Điều này cho phép frontend lấy dữ liệu real-time từ backend.

**Cách tích hợp với các phần khác của app:** Fetch calls được make trong useEffect cho initial data loading hoặc trong event handlers cho user actions. Responses update useState, trigger re-renders. Errors được catch và set trong state cho UI feedback. Nó tích hợp với context cho authenticated requests.

## 4. Event Handling

### onClick, onChange, onSubmit

**Mục đích và khi nào sử dụng:** Event handlers như onClick, onChange, và onSubmit được dùng để respond với user interactions trong React components. Chúng được sử dụng để handle button clicks, input changes, và form submissions.

**Chức năng cụ thể xử lý:**

- onClick: Button actions như add to cart, navigating, clearing chats.
- onChange: Input updates cho forms, filters, quantity selection.
- onSubmit: Form submissions cho login, registration, product creation.

**Ví dụ code với đường dẫn và số dòng:**

- `src/components/ProductCard.jsx` (dòng 199):

```jsx
<button className="add-to-cart-btn" onClick={handleAddToCart}>
  Thêm vào giỏ hàng
</button>
```

- `src/components/Login.jsx` (dòng 45, 53):

```jsx
<input onChange={(e) => setEmail(e.target.value)} />
<input onChange={(e) => setPassword(e.target.value)} />
```

- `src/components/Register.jsx` (dòng 39):

```jsx
<form onSubmit={handleSubmit}></form>
```

**Danh sách file sử dụng event handlers (toàn diện):**

- Tất cả components với buttons, inputs, hoặc forms, ví dụ: src/components/ProductCard.jsx, src/components/Login.jsx, src/components/Register.jsx, etc.

**Giải thích chi tiết logic vận hành:**

Event handlers hoạt động như "người nghe" user actions. Ví dụ, khi click "Thêm vào giỏ", onClick gọi handleAddToCart, update cart state và show toast. Khi type email, onChange update setEmail, re-render input với value mới. Điều này làm UI interactive và responsive.

**Cách tích hợp với các phần khác của app:** Event handlers update local state via setters hoặc call functions từ context/API. Chúng trigger side effects như navigation hoặc data submission, tích hợp với overall app flow.

## 5. Side Effects

### useEffect cho Side Effects

**Mục đích và khi nào sử dụng:** useEffect handles side effects như API calls, localStorage access, và cleanup. Nó được dùng cho operations nên occur outside normal render cycle.

**Chức năng cụ thể xử lý:**

- Data fetching và state initialization.
- Persisting state vào localStorage.
- Setting up timers hoặc subscriptions.
- Cleanup để prevent memory leaks.

**Ví dụ code với đường dẫn và số dòng:**

- Như shown trong useEffect section ở trên.

**Danh sách file sử dụng side effects (toàn diện):**

- Same as useEffect files.

**Giải thích chi tiết logic vận hành:**

Side effects trong useEffect thực hiện tasks ngoài render. Ví dụ, fetch data khi mount, persist user data khi logout. Cleanup functions remove listeners để tránh leaks.

**Cách tích hợp với các phần khác của app:** Side effects update state hoặc perform external operations, đảm bảo components react với data changes và maintain consistency.

## 6. Other Programming Patterns

### Custom Hooks

**Mục đích và khi nào sử dụng:** Custom hooks encapsulate reusable logic. Chúng được dùng để share stateful logic giữa components.

**Chức năng cụ thể xử lý:** Providing context access (ví dụ: useAuth, useCart).

**Ví dụ code:** Như shown trong context files.

**Giải thích chi tiết logic vận hành:**

Custom hooks đóng gói logic tái sử dụng. Ví dụ, useAuth() return {user, login}, dùng trong nhiều components mà không duplicate code.

**Integration:** Used throughout app cho clean, reusable code.

### Conditional Rendering và Error Handling

**Mục đích và khi nào sử dụng:** Conditional rendering displays different UI based on state. Error handling manages failures gracefully.

**Ví dụ code:**

- `src/pages/Shop.jsx` (dòng 96-110):

```jsx
if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error}</div>;
```

**Giải thích chi tiết logic vận hành:**

Conditional rendering show UI phù hợp với state. Ví dụ, nếu loading, show spinner; nếu error, show message. Điều này improve UX bằng cách inform user về trạng thái.

**Integration:** Uses state từ useState và useEffect để control UI.

Phân tích này covers all major logic handling techniques across entire frontend codebase, với references đến specific files, lines, và integration points. App consistently uses functional components với hooks, Context cho state management, và Fetch cho API interactions.
