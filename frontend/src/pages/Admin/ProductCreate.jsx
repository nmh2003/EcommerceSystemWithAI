import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createProduct, getCategories, uploadImage } from "../../utils/api";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import AdminMenu from "./AdminMenu";
import { useToast } from "../../context/ToastContext"; // Import useToast hook for notifications.

function ProductCreate() {

  const navigate = useNavigate();
  const { addToast } = useToast(); // Get addToast from context.

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  const [image, setImage] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [stock, setStock] = useState("");

  const fetchCategoriesData = useCallback(async () => {
    try {
      const data = await getCategories();
      setCategories(data.categories || data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  }, []);

  useEffect(() => {
    fetchCategoriesData();
  }, [fetchCategoriesData]);

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("image", file);

      const result = await uploadImage(formData);
      if (result.imageUrl) {
        setImage(result.imageUrl);
        addToast("Upload ảnh thành công!", "success");
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      addToast("Upload ảnh thất bại!", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      const productData = {
        name,
        description,
        price: parseFloat(price), // Chuyển sang number
        category,
        brand,
        countInStock: parseInt(stock), // Chuyển sang number
        image, // imageUrl từ upload API
      };

      const result = await createProduct(productData);

      if (result.error) {
        setError(result.error);
      } else {
        addToast("Tạo sản phẩm thành công!", "success");
        navigate("/admin/products"); // Navigate về danh sách products
      }
    } catch (err) {
      console.error("Error creating product:", err);
      setError("Tạo sản phẩm thất bại. Thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <Message variant="error">{error}</Message>;
  }

  return (
    <div style={{ marginLeft: "10rem" }}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <AdminMenu />
        <div style={{ width: "75%", padding: "12px" }}>
          <div style={{ height: "3rem" }}>Tạo sản phẩm</div>

          {image && (
            <div style={{ textAlign: "center" }}>
              <img
                src={image}
                alt="product"
                style={{
                  display: "block",
                  margin: "0 auto",
                  width: "100%",
                  height: "40%",
                  maxHeight: "300px",
                  objectFit: "cover",
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: "12px" }}>
            <label
              style={{
                display: "block",
                width: "100%",
                textAlign: "center",
                padding: "44px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                backgroundColor: "#1f2937",
                color: "white",
              }}
            >
              {image ? "Thay đổi ảnh" : "Upload ảnh"}
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={uploadFileHandler}
                style={{ display: "none" }}
              />
            </label>
          </div>

          <div style={{ padding: "12px" }}>
            <form onSubmit={handleSubmit}>

              <div style={{ display: "flex", flexWrap: "wrap" }}>
                <div style={{ marginRight: "5rem" }}>
                  <label
                    htmlFor="name"
                    style={{ display: "block", marginBottom: "4px" }}
                  >
                    Tên sản phẩm
                  </label>
                  <input
                    type="text"
                    id="name"
                    style={{
                      padding: "16px",
                      marginBottom: "12px",
                      width: "30rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      backgroundColor: "#101011",
                      color: "white",
                    }}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="price"
                    style={{ display: "block", marginBottom: "4px" }}
                  >
                    Giá
                  </label>
                  <input
                    type="number"
                    id="price"
                    style={{
                      padding: "16px",
                      marginBottom: "12px",
                      width: "30rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      backgroundColor: "#101011",
                      color: "white",
                    }}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap" }}>
                <div>
                  <label
                    htmlFor="brand"
                    style={{ display: "block", marginBottom: "4px" }}
                  >
                    Thương hiệu
                  </label>
                  <input
                    type="text"
                    id="brand"
                    style={{
                      padding: "16px",
                      marginBottom: "12px",
                      width: "30rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      backgroundColor: "#101011",
                      color: "white",
                    }}
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    required
                  />
                </div>
              </div>

              <label
                htmlFor="description"
                style={{
                  display: "block",
                  marginBottom: "20px",
                  marginTop: "20px",
                }}
              >
                Mô tả
              </label>
              <textarea
                id="description"
                style={{
                  padding: "8px",
                  marginBottom: "12px",
                  width: "95%",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  backgroundColor: "#101011",
                  color: "white",
                  minHeight: "100px",
                }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <label
                    htmlFor="stock"
                    style={{ display: "block", marginBottom: "4px" }}
                  >
                    Số lượng tồn kho
                  </label>
                  <input
                    type="number"
                    id="stock"
                    min="0"
                    style={{
                      padding: "16px",
                      marginBottom: "12px",
                      width: "30rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      backgroundColor: "#101011",
                      color: "white",
                    }}
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="category"
                    style={{ display: "block", marginBottom: "4px" }}
                  >
                    Danh mục
                  </label>
                  <select
                    id="category"
                    style={{
                      padding: "16px",
                      marginBottom: "12px",
                      width: "30rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      backgroundColor: "#101011",
                      color: "white",
                      marginRight: "5rem",
                    }}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  style={{
                    padding: "16px 40px",
                    marginTop: "20px",
                    borderRadius: "8px",
                    fontSize: "18px",
                    fontWeight: "bold",
                    backgroundColor: "#16a34a",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Tạo
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCreate;
