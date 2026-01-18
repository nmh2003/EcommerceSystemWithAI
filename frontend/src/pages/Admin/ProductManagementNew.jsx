import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createProduct, uploadProductImage } from "../../utils/api";
import { getCategories } from "../../utils/api";
import AdminMenu from "./AdminMenu";
import "./ProductManagement.css";
import { useToast } from "../../context/ToastContext"; // Import useToast hook for notifications.

function ProductManagement() {

  const navigate = useNavigate();
  const { addToast } = useToast(); // Get addToast from context.

  const [image, setImage] = useState("");

  const [name, setName] = useState("");

  const [description, setDescription] = useState("");

  const [price, setPrice] = useState("");

  const [category, setCategory] = useState("");

  const [quantity, setQuantity] = useState("");

  const [brand, setBrand] = useState("");

  const [countInStock, setCountInStock] = useState(0);

  const [imageUrl, setImageUrl] = useState(null);

  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data.categories || data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      setLoading(true);
      const result = await uploadProductImage(formData);
      setImage(file); // Lưu file object
      setImageUrl(result.image); // URL để preview
      addToast("Upload ảnh thành công!", "success");
    } catch (err) {
      console.error("Error uploading image:", err);
      addToast("Upload ảnh thất bại: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !price || !category) {
      addToast("Vui lòng điền đầy đủ thông tin bắt buộc!", "warning");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const productData = new FormData();
      productData.append("image", image);
      productData.append("name", name);
      productData.append("description", description);
      productData.append("price", price);
      productData.append("category", category);
      productData.append("quantity", quantity);
      productData.append("brand", brand);
      productData.append("countInStock", countInStock);

      const result = await createProduct(productData);

      addToast(`${result.name} đã được tạo thành công!`, "success");
      navigate("/"); // Navigate về home như Ecom
    } catch (err) {
      console.error("Error creating product:", err);
      setError(err.message || "Tạo sản phẩm thất bại. Thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>

      <div className="product-management-container-ecom">

        <div className="product-management-main">

          <div className="admin-menu-sidebar">
            <AdminMenu />
          </div>

          <div className="product-form-area">

            <div className="form-title">Tạo sản phẩm</div>

            {imageUrl && (
              <div className="image-preview">
                <img
                  src={imageUrl}
                  alt="product preview"
                  className="preview-image"
                />
              </div>
            )}

            <div className="image-upload-section">
              <label className="upload-label">
                {image ? image.name : "Tải lên hình ảnh"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="upload-input"
                />
              </label>
            </div>

            <div className="form-fields">

              <div className="form-row">

                <div className="form-field">
                  <label htmlFor="name" className="form-label">
                    Tên sản phẩm
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nhập tên sản phẩm"
                  />
                </div>

                <div className="form-field ml-10">
                  <label htmlFor="price" className="form-label">
                    Giá
                  </label>
                  <input
                    id="price"
                    type="number"
                    className="form-input"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Nhập giá"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="quantity" className="form-label">
                    Số lượng
                  </label>
                  <input
                    id="quantity"
                    type="number"
                    className="form-input"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Nhập số lượng"
                  />
                </div>

                <div className="form-field ml-10">
                  <label htmlFor="brand" className="form-label">
                    Thương hiệu
                  </label>
                  <input
                    id="brand"
                    type="text"
                    className="form-input"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Nhập thương hiệu"
                  />
                </div>
              </div>

              <div className="form-field-full">
                <label htmlFor="description" className="form-label">
                  Mô tả
                </label>
                <textarea
                  id="description"
                  className="form-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Nhập mô tả sản phẩm"
                  rows="4"
                />
              </div>

              <div className="form-row-bottom">
                <div className="form-field">
                  <label htmlFor="countInStock" className="form-label">
                    Số lượng tồn kho
                  </label>
                  <input
                    id="countInStock"
                    type="number"
                    className="form-input"
                    value={countInStock}
                    onChange={(e) => setCountInStock(e.target.value)}
                    placeholder="Nhập số lượng tồn kho"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="category" className="form-label">
                    Danh mục
                  </label>
                  <select
                    id="category"
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
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

              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className="submit-button"
              >
                {loading ? "Đang tạo..." : "Tạo sản phẩm"}
              </button>

              {error && <div className="error-message">{error}</div>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductManagement;
