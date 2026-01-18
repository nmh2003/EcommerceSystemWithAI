import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getProductById,
  createProduct,
  updateProduct,
  uploadImage,
  getCategories,
} from "../../utils/api";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import "./ProductFormPage.css";
import { useToast } from "../../context/ToastContext"; // Import useToast hook for notifications.

function ProductFormPage() {

  const { id } = useParams();

  const navigate = useNavigate();
  const { addToast } = useToast(); // Get addToast from context.

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    brand: "",
    category: "", // Category ID
    countInStock: "",
    image: "", // Image URL
  });

  const [imageFile, setImageFile] = useState(null);

  const [imagePreview, setImagePreview] = useState(null);

  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState(null);

  const isEditMode = Boolean(id);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (isEditMode) {
      fetchProduct();
    }

  }, [id]);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data.categories || data);
    } catch (err) {
      console.error("Error fetching categories:", err);

    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getProductById(id);

      setFormData({
        name: data.name || "",
        description: data.description || "",
        price: data.price || "",
        brand: data.brand || "",
        category: data.category?.id || "",
        countInStock: data.countInStock || "",
        image: data.image || "",
      });

      if (data.image) {
        setImagePreview(data.image);
      }
    } catch (err) {
      console.error("Error fetching product:", err);
      setError(err.message || "Không thể tải thông tin sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      addToast("Vui lòng chọn file ảnh!", "error");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      addToast("File ảnh quá lớn! Vui lòng chọn file nhỏ hơn 5MB", "error");
      return;
    }

    setImageFile(file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

  };

  const handleUploadImage = async () => {
    if (!imageFile) {

      return formData.image;
    }

    try {
      setUploading(true);

      const data = await uploadImage(imageFile);

      return data.imageUrl || data.image;
    } catch (err) {
      console.error("Error uploading image:", err);
      throw new Error(err.message || "Không thể upload ảnh");
    } finally {
      setUploading(false);
    }
  };

  const validateForm = () => {

    if (!formData.name.trim()) {
      addToast("Vui lòng nhập tên sản phẩm!", "warning");
      return false;
    }

    if (!formData.price || formData.price <= 0) {
      addToast("Vui lòng nhập giá hợp lệ!", "warning");
      return false;
    }

    if (!formData.countInStock || formData.countInStock < 0) {
      addToast("Vui lòng nhập số lượng hợp lệ!", "warning");
      return false;
    }

    if (!formData.category) {
      addToast("Vui lòng chọn danh mục!", "warning");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      let imageUrl = formData.image;
      if (imageFile) {
        imageUrl = await handleUploadImage();
      }

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        brand: formData.brand.trim(),
        category: formData.category, // Category ID
        countInStock: parseInt(formData.countInStock),
        image: imageUrl,
      };

      if (isEditMode) {

        await updateProduct(id, productData);
        addToast("Cập nhật sản phẩm thành công!", "success");
      } else {

        await createProduct(productData);
        addToast("Tạo sản phẩm thành công!", "success");
      }

      navigate("/admin/products");
    } catch (err) {
      console.error("Error submitting form:", err);
      setError(err.message || "Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (
      window.confirm("Bạn có chắc muốn hủy? Các thay đổi sẽ không được lưu.")
    ) {
      navigate("/admin/products");
    }
  };

  if (loading) {
    return (
      <div className="product-form-container">
        <Loader />
      </div>
    );
  }

  return (
    <div className="product-form-container">

      <div className="form-header">
        <h1 className="form-title">
          {isEditMode ? "Chỉnh Sửa Sản Phẩm" : "Thêm Sản Phẩm Mới"}
        </h1>
      </div>

      {error && <Message variant="error">{error}</Message>}

      <form className="product-form" onSubmit={handleSubmit}>

        <div className="form-section">
          <h2 className="section-title">📷 Hình Ảnh Sản Phẩm</h2>

          {imagePreview && (
            <div className="image-preview-container">
              <img src={imagePreview} alt="Preview" className="image-preview" />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="imageFile" className="file-upload-label">
              {imageFile ? `📎 ${imageFile.name}` : "📁 Chọn ảnh sản phẩm"}
            </label>
            <input
              type="file"
              id="imageFile"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input"
            />
            <p className="input-hint">Định dạng: JPG, PNG, GIF. Tối đa: 5MB</p>
          </div>
        </div>

        <div className="form-section">
          <h2 className="section-title">📝 Thông Tin Cơ Bản</h2>

          <div className="form-group">
            <label htmlFor="name" className="form-label required">
              Tên Sản Phẩm
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên sản phẩm..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Mô Tả
            </label>
            <textarea
              id="description"
              name="description"
              className="form-textarea"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              placeholder="Nhập mô tả sản phẩm..."
            />
          </div>

          <div className="form-row">

            <div className="form-group">
              <label htmlFor="price" className="form-label required">
                Giá (VNĐ)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                className="form-input"
                value={formData.price}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="1000"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="brand" className="form-label">
                Thương Hiệu
              </label>
              <input
                type="text"
                id="brand"
                name="brand"
                className="form-input"
                value={formData.brand}
                onChange={handleChange}
                placeholder="Nhập thương hiệu..."
              />
            </div>
          </div>

          <div className="form-row">

            <div className="form-group">
              <label htmlFor="category" className="form-label required">
                Danh Mục
              </label>
              <select
                id="category"
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="countInStock" className="form-label required">
                Số Lượng Tồn Kho
              </label>
              <input
                type="number"
                id="countInStock"
                name="countInStock"
                className="form-input"
                value={formData.countInStock}
                onChange={handleChange}
                placeholder="0"
                min="0"
                required
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={handleCancel}
            disabled={submitting || uploading}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="btn-submit"
            disabled={submitting || uploading}
          >
            {submitting
              ? "Đang xử lý..."
              : uploading
              ? "Đang upload ảnh..."
              : isEditMode
              ? "Cập Nhật"
              : "Tạo Mới"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductFormPage;
