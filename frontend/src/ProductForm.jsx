import React, { useState } from "react";
import { useToast } from "./context/ToastContext";

function ProductForm({ onAdd }) {

  const [name, setName] = useState("");

  const [price, setPrice] = useState(0);

  const [imageUrl, setImageUrl] = useState("");

  const { addToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    const newProduct = { name, price, imageUrl };
    fetch("http://localhost:1337/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(newProduct),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Không thể tạo sản phẩm");
        return res.json();
      })
      .then((data) => {
        onAdd(data); // Update list cha từ response backend (with id from DB).
        setName(""); // Reset form.
        setPrice(0);
        setImageUrl("");
      })
      .catch((e) => addToast("Lỗi: " + e.message, "error")); // Error handling đơn giản (có thể thêm state error).
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
      <label htmlFor="name">Tên sản phẩm:</label>
      <input
        id="name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        style={{ margin: "10px", padding: "5px" }}
      />

      <label htmlFor="price">Giá sản phẩm:</label>
      <input
        id="price"
        type="number"
        value={price}
        onChange={(e) => setPrice(parseFloat(e.target.value))}
        required
        style={{ margin: "10px", padding: "5px" }}
      />

      <label htmlFor="imageUrl">URL hình ảnh sản phẩm (mặc định):</label>
      <input
        id="imageUrl"
        type="url"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        placeholder="https://via.placeholder.com/150?text=Image"
        style={{ margin: "10px", padding: "5px" }}
      />

      <button type="submit" style={{ padding: "5px 10px" }}>
        Thêm sản phẩm
      </button>
    </form>
  );
}

export default ProductForm;
