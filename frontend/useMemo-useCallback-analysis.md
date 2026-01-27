# Phân Tích Sử Dụng useMemo và useCallback Trong Frontend

## Tổng Quan

Trong dự án ecommerce CMS này, `useMemo` và `useCallback` được sử dụng để tối ưu hóa performance React, tránh re-render không cần thiết và cache các giá trị tính toán. Dưới đây là phân tích chi tiết A-Z cho từng trường hợp sử dụng, bao gồm:

- **Vị trí**: File và dòng code
- **Mục đích**: Tại sao dùng hook này
- **Cách hoạt động**: Logic bên trong
- **Dependencies**: Mảng phụ thuộc
- **Lợi ích**: Performance và UX cải thiện
- **Ví dụ thực tế**: Code snippet
- **Nguy cơ nếu không dùng**: Vấn đề có thể xảy ra

## 1. useMemo trong AdminOrderManagement.jsx (Dòng 73)

### Vị trí

- File: `frontend/src/pages/Admin/AdminOrderManagement.jsx`
- Dòng: 73-103
- Biến: `filteredAndSearchedOrders`

### Mục đích

Tối ưu hóa việc lọc và tìm kiếm danh sách đơn hàng. Khi có nhiều đơn hàng (hàng trăm), việc filter/search mỗi lần re-render sẽ tốn kém nếu không cache kết quả.

### Cách hoạt động

- Nhận `orders`, `filterStatus`, `searchQuery` làm dependencies
- Logic: Lọc theo trạng thái (paid/unpaid/delivered/pending), sau đó search theo ID hoặc email
- Trả về mảng `result` đã được filter/search

### Dependencies

```jsx
}, [orders, filterStatus, searchQuery]);
```

### Lợi ích

- **Performance**: Chỉ tính toán lại khi `orders`, `filterStatus`, hoặc `searchQuery` thay đổi
- **UX**: Filter/search mượt mà, không lag khi có nhiều đơn hàng
- **Memory**: Cache kết quả, giảm GC pressure

### Ví dụ thực tế

```jsx
const filteredAndSearchedOrders = useMemo(() => {
  let result = orders;
  // Filter logic...
  if (searchQuery.trim() !== "") {
    // Search logic...
  }
  return result;
}, [orders, filterStatus, searchQuery]);
```

### Nguy cơ nếu không dùng

- Mỗi lần component re-render (do state khác thay đổi), toàn bộ filter/search chạy lại
- Với 1000+ orders, có thể gây lag UI, đặc biệt trên mobile
- Tăng CPU usage, ảnh hưởng battery life

## 2. useMemo trong OrderClone.jsx (Dòng 19)

### Vị trí

- File: `frontend/src/pages/Orders/OrderClone.jsx`
- Dòng: 19
- Biến: `userInfo`

### Mục đích

Cache thông tin user từ localStorage. User info thường không thay đổi trong session, nên không cần fetch lại mỗi lần component re-render.

### Cách hoạt động

- Gọi `getUser()` từ utils/localStorage
- Dependencies rỗng `[]` → chỉ tính toán 1 lần khi mount

### Dependencies

```jsx
const userInfo = useMemo(() => getUser(), []);
```

### Lợi ích

- **Performance**: Tránh gọi `getUser()` (có thể parse JSON) mỗi re-render
- **Consistency**: User info ổn định trong component lifecycle
- **Memory**: Giảm localStorage access

### Ví dụ thực tế

```jsx
const userInfo = useMemo(() => getUser(), []);
```

### Nguy cơ nếu không dùng

- Nếu component re-render thường xuyên (do state khác), `getUser()` gọi liên tục
- Với localStorage lớn, có thể chậm trên low-end devices
- Không đảm bảo user info consistency nếu có thay đổi ngoài component

## 3. useCallback trong VRMViewerVU.jsx (Nhiều chỗ)

### Vị trí

- File: `frontend/src/pages/VRMViewerVU.jsx`
- Các hàm: `startBlinkLoop`, `loadVRM`, `processAudioInput`, `setupMicrophone`, `animate`, `onWindowResize`, `initializeVRM`, `cleanup`

### Mục đích

Tối ưu hóa 3D rendering và audio processing. VRM viewer sử dụng Three.js với animation loops, microphone input – các hàm này nếu tạo mới mỗi render sẽ gây memory leak và performance issues.

### Cách hoạt động từng hàm

#### startBlinkLoop (Dòng 41)

- Tạo loop nhấp nháy mắt cho VRM model
- Dependencies: `[]` (không phụ thuộc gì)
- Logic: Set timeout random, update blendShapeProxy

#### loadVRM (Dòng 83)

- Load VRM model từ URL
- Dependencies: `[startBlinkLoop]`
- Logic: Sử dụng GLTFLoader, add to scene, call startBlinkLoop

#### processAudioInput (Dòng 168)

- Xử lý input âm thanh từ microphone
- Dependencies: `[]`
- Logic: Tính volume, update mouth/body animations, expressions

#### setupMicrophone (Dòng 308)

- Setup Web Audio API
- Dependencies: `[processAudioInput]`
- Logic: getUserMedia, create analyser, connect nodes

#### animate (Dòng 350)

- Animation loop chính
- Dependencies: `[]`
- Logic: requestAnimationFrame, update VRM, render scene

#### onWindowResize (Dòng 364)

- Handle window resize
- Dependencies: `[]`
- Logic: Update camera aspect, renderer size

#### initializeVRM (Dòng 372)

- Khởi tạo toàn bộ VRM scene
- Dependencies: `[isInitialized, vrmModel, loadVRM, setupMicrophone, animate, onWindowResize]`
- Logic: Create renderer/camera/controls/scene, setup lights

#### cleanup (Dòng 431)

- Dọn dẹp resources
- Dependencies: `[onWindowResize]`
- Logic: Disconnect audio, dispose renderer/VRM, remove listeners

### Lợi ích

- **Performance**: Tránh tạo function mới mỗi render, giảm GC
- **Memory**: Prevent memory leaks trong WebGL/audio contexts
- **Stability**: Event listeners và animation loops ổn định

### Ví dụ thực tế

```jsx
const animate = useCallback(() => {
  requestAnimationFrame(animate);
  // Update VRM and render
}, []);
```

### Nguy cơ nếu không dùng

- Function mới mỗi render → event listeners duplicate
- Memory leak trong WebGL contexts
- Audio processing lag do function recreation
- VRM animations không smooth

## 4. useCallback trong ProductUpdate.jsx (Dòng 33 & 54)

### Vị trí

- File: `frontend/src/pages/Admin/ProductUpdate.jsx`
- Hàm: `fetchProductData` (dòng 33), `fetchCategoriesData` (dòng 54)

### Mục đích

Tối ưu hóa API calls trong form update. Các hàm fetch nếu không memo sẽ tạo mới mỗi render, gây useEffect re-run không cần thiết.

### Cách hoạt động

#### fetchProductData

- Fetch product by ID
- Dependencies: `[id]` (từ URL params)
- Logic: Call API, set states (name, price, etc.)

#### fetchCategoriesData

- Fetch danh sách categories
- Dependencies: `[]` (không đổi)
- Logic: Call API, set categories state

### Lợi ích

- **Performance**: useEffect chỉ re-run khi dependencies thực sự thay đổi
- **API Efficiency**: Tránh duplicate requests
- **UX**: Form load nhanh hơn

### Ví dụ thực tế

```jsx
const fetchProductData = useCallback(async () => {
  const data = await getProductById(id);
  // Set states...
}, [id]);
```

### Nguy cơ nếu không dùng

- useEffect re-run mỗi render → API spam
- Loading states flicker
- Network overhead không cần thiết

## 5. useCallback trong ProductCreate.jsx (Dòng 26)

### Vị trí

- File: `frontend/src/pages/Admin/ProductCreate.jsx`
- Hàm: `fetchCategoriesData` (dòng 26)

### Mục đích

Tương tự ProductUpdate: Cache hàm fetch categories để tránh re-run useEffect không cần thiết trong form tạo sản phẩm mới.

### Cách hoạt động

- Fetch categories từ API
- Dependencies: `[]`
- Logic: Set categories state

### Lợi ích

- **Consistency**: Categories load một lần
- **Performance**: Giảm API calls redundant
- **Maintainability**: Code clean hơn

### Ví dụ thực tế

```jsx
const fetchCategoriesData = useCallback(async () => {
  const data = await getCategories();
  setCategories(data.categories || data);
}, []);
```

### Nguy cơ nếu không dùng

- Categories fetch lại mỗi render
- UI lag khi form re-render
- Potential race conditions nếu multiple calls

## Kết Luận và Best Practices

### Khi nào nên dùng useMemo/useCallback

- **useMemo**: Cho expensive computations (filter, sort, calculations)
- **useCallback**: Cho functions passed as props hoặc event handlers
- **Dependencies**: Chỉ include những gì thực sự cần, tránh over-memoization

### Khi nào không nên dùng

- Functions đơn giản không tốn kém
- Values không dùng trong render
- Khi dependencies thay đổi thường xuyên

### Performance Tips

- Profile với React DevTools trước khi optimize
- useMemo sâu có thể counter-productive nếu dependencies phức tạp
- Combine với React.memo cho child components

### Trong project này

- AdminOrderManagement: useMemo hiệu quả cho large datasets
- VRMViewer: useCallback critical cho 3D/audio performance
- Forms (ProductUpdate/Create): useCallback tránh unnecessary re-fetches
- OrderClone: useMemo cho static user data

Những usage này cho thấy team đã hiểu React optimization patterns tốt, đặc biệt cho performance-critical features như 3D rendering và data filtering.</content>
<parameter name="filePath">e:\DOCUMENT\thucTap\fin\fin\my-cms\frontend\useMemo-useCallback-analysis.md
