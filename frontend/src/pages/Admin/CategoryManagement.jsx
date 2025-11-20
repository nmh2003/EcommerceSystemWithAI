import { useState, useEffect } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../utils/api";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import AdminMenu from "./AdminMenu";
import "./CategoryManagement.css";
import { useToast } from "../../context/ToastContext"; // Import useToast hook for notifications.

function CategoryManagement() {

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [name, setName] = useState("");

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [updatingName, setUpdatingName] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const { addToast } = useToast(); // Get addToast from context.

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCategories();
      setCategories(data.categories || data);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(err.message || "Không thể tải danh sách danh mục");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();

    if (!name) {
      addToast("Tên danh mục là bắt buộc", "warning");
      return;
    }

    try {
      const result = await createCategory({ name });
      if (result.error) {
        addToast(result.error, "error");
      } else {
        setName("");
        addToast(`${result.name} đã được tạo.`, "success");
        fetchCategories(); // Refresh list
      }
    } catch (error) {
      console.error(error);
      addToast("Tạo danh mục thất bại, thử lại.", "error");
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();

    if (!updatingName) {
      addToast("Tên danh mục là bắt buộc", "warning");
      return;
    }

    try {
      const result = await updateCategory(selectedCategory.id, {
        name: updatingName,
      });

      if (result.error) {
        addToast(result.error, "error");
      } else {
        addToast(`${result.name} đã được cập nhật`, "success");
        setSelectedCategory(null);
        setUpdatingName("");
        setModalVisible(false);
        fetchCategories(); // Refresh list
      }
    } catch (error) {
      console.error(error);
      addToast("Cập nhật danh mục thất bại", "error");
    }
  };

  const handleDeleteCategory = async () => {
    try {
      const result = await deleteCategory(selectedCategory.id);

      if (result.error) {
        addToast(result.error, "error");
      } else {
        addToast(`${result.name} đã được xóa.`, "success");
        setSelectedCategory(null);
        setModalVisible(false);
        fetchCategories(); // Refresh list
      }
    } catch (error) {
      console.error(error);
      addToast("Xóa danh mục thất bại. Thử lại.", "error");
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <Message variant="error">{error}</Message>;
  }

  return (
    <div
      style={{ marginLeft: "10rem", display: "flex", flexDirection: "column" }}
    >
      <AdminMenu />
      <div style={{ width: "75%", padding: "12px" }}>
        <div style={{ height: "3rem" }}>Quản lý danh mục</div>

        <form onSubmit={handleCreateCategory} style={{ marginBottom: "1rem" }}>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="text"
              placeholder="Tên danh mục"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                flex: 1,
                padding: "0.5rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.375rem",
                outline: "none",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#ec4899",
                color: "white",
                border: "none",
                borderRadius: "0.375rem",
                cursor: "pointer",
              }}
            >
              Tạo Danh Mục
            </button>
          </div>
        </form>

        <br />
        <hr />

        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {categories?.map((category) => (
            <div key={category.id}>
              <button
                style={{
                  backgroundColor: "black",
                  border: "1px solid #ec4899",
                  color: "#ec4899",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.5rem",
                  margin: "12px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onClick={() => {
                  setModalVisible(true);
                  setSelectedCategory(category);
                  setUpdatingName(category.name);
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#ec4899";
                  e.target.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "black";
                  e.target.style.color = "#ec4899";
                }}
              >
                {category.name}
              </button>
            </div>
          ))}
        </div>

        {modalVisible && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                padding: "2rem",
                borderRadius: "0.5rem",
                width: "90%",
                maxWidth: "500px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <h2 style={{ margin: 0, color: "black" }}>Cập Nhật Danh Mục</h2>
                <button
                  onClick={() => setModalVisible(false)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "1.5rem",
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleUpdateCategory}>
                <div style={{ marginBottom: "1rem" }}>
                  <input
                    type="text"
                    placeholder="Tên danh mục"
                    value={updatingName}
                    onChange={(e) => setUpdatingName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.375rem",
                      outline: "none",
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: "0.5rem",
                      backgroundColor: "#10b981",
                      color: "white",
                      border: "none",
                      borderRadius: "0.375rem",
                      cursor: "pointer",
                    }}
                  >
                    Cập Nhật
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteCategory}
                    style={{
                      flex: 1,
                      padding: "0.5rem",
                      backgroundColor: "#ef4444",
                      color: "white",
                      border: "none",
                      borderRadius: "0.375rem",
                      cursor: "pointer",
                    }}
                  >
                    Xóa
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryManagement;
