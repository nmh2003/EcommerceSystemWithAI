import { useState, useEffect } from "react";

import { Link } from "react-router-dom";

import ProductCard from "../components/ProductCard";

import "./Shop.css";

import { PAGINATION } from "../utils/constants";

function Shop() {

  const [allProducts, setAllProducts] = useState([]);

  const [filteredProducts, setFilteredProducts] = useState([]);

  const [categories, setCategories] = useState([]);

  const [checkedCategories, setCheckedCategories] = useState([]);

  const [selectedBrand, setSelectedBrand] = useState("");

  const [priceFilter, setPriceFilter] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {

    async function fetchData() {
      try {

        setLoading(true);

        const productsResponse = await fetch(
          `http://localhost:1337/api/products?limit=1000`
        );

        if (!productsResponse.ok) {
          throw new Error("Failed to fetch products");
        }

        const productsData = await productsResponse.json();

        const productsArray = Array.isArray(productsData)
          ? productsData
          : Array.isArray(productsData?.products)
          ? productsData.products
          : [];

        setAllProducts(productsArray); // Tất cả products
        setFilteredProducts(productsArray); // Ban đầu hiển thị tất cả

        const categoriesResponse = await fetch(
          "http://localhost:1337/api/categories"
        );

        if (!categoriesResponse.ok) {
          throw new Error("Failed to fetch categories");
        }

        const categoriesData = await categoriesResponse.json();

        const categoriesArray = Array.isArray(categoriesData)
          ? categoriesData
          : Array.isArray(categoriesData?.categories)
          ? categoriesData.categories
          : [];

        setCategories(categoriesArray);

        setLoading(false);
      } catch (err) {

        console.error("Error fetching data:", err);
        setError(err.message || "Đã xảy ra lỗi!");
        setLoading(false);
      }
    }

    fetchData();
  }, []); // [] = chỉ chạy 1 lần khi component mount

  useEffect(() => {

    let filtered = [...allProducts];

    if (checkedCategories.length > 0) {
      filtered = filtered.filter((product) => {

        return checkedCategories.includes(product.category?.id);
      });
    }

    if (selectedBrand) {
      filtered = filtered.filter((product) => {
        return product.brand === selectedBrand;
      });
    }

    if (priceFilter) {
      filtered = filtered.filter((product) => {

        return product.price.toString().includes(priceFilter);
      });
    }

    setFilteredProducts(filtered);
  }, [checkedCategories, selectedBrand, priceFilter, allProducts]);

  function handleCategoryChange(event, categoryId) {

    const isChecked = event.target.checked;

    if (isChecked) {

      setCheckedCategories([...checkedCategories, categoryId]);
    } else {

      setCheckedCategories(checkedCategories.filter((id) => id !== categoryId));
    }
  }

  function handleBrandChange(brand) {

    setSelectedBrand(brand);
  }

  function handlePriceChange(event) {

    const value = event.target.value;

    setPriceFilter(value);
  }

  function handleReset() {

    setCheckedCategories([]); // Xóa tất cả categories đã check
    setSelectedBrand(""); // Xóa brand đã chọn
    setPriceFilter(""); // Xóa giá đã nhập

    setFilteredProducts(allProducts);
  }

  function getUniqueBrands() {

    if (!Array.isArray(allProducts)) return [];

    const brands = allProducts.map((product) => product.brand);

    const validBrands = brands.filter((brand) => brand);

    return Array.from(new Set(validBrands));
  }

  const uniqueBrands = Array.isArray(getUniqueBrands())
    ? getUniqueBrands()
    : [];

  if (loading) {
    return (
      <div className="shop-loading">
        <div className="loading-spinner"></div>
        <p className="loading-text">Đang tải sản phẩm...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shop-error">
        <div className="error-icon">⚠️</div>
        <h2 className="error-title">Ối! Có lỗi xảy ra</h2>
        <p className="error-message">{error}</p>
        <button
          className="error-retry"
          onClick={() => window.location.reload()}
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="shop-page">

      <div className="shop-container">

        <div className="shop-layout">

          <aside className="shop-sidebar">

            <div className="filter-section">
              <h2 className="filter-title">Lọc theo danh mục</h2>

              <div className="filter-options filter-categories">
                {categories.map((category) => (
                  <div key={category.id} className="filter-option">

                    <input
                      type="checkbox"
                      id={`category-${category.id}`}
                      checked={checkedCategories.includes(category.id)}
                      onChange={(e) => handleCategoryChange(e, category.id)}
                      className="filter-checkbox"
                    />
                    <label
                      htmlFor={`category-${category.id}`}
                      className="filter-label"
                    >
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h2 className="filter-title">Lọc theo thương hiệu</h2>

              <div className="filter-options">
                {uniqueBrands.map((brand) => (
                  <div key={brand} className="filter-option">

                    <input
                      type="radio"
                      id={`brand-${brand}`}
                      name="brand"
                      checked={selectedBrand === brand}
                      onChange={() => handleBrandChange(brand)}
                      className="filter-radio"
                    />
                    <label htmlFor={`brand-${brand}`} className="filter-label">
                      {brand}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h2 className="filter-title">Lọc theo giá</h2>

              <div className="filter-options filter-price">

                <input
                  type="text"
                  placeholder="Nhập giá"
                  value={priceFilter}
                  onChange={handlePriceChange}
                  className="filter-input"
                />
              </div>
            </div>

            <div className="filter-reset-container">

              <button className="filter-reset" onClick={handleReset}>
                Đặt lại
              </button>
            </div>
          </aside>

          <main className="shop-main">

            <div className="shop-header">

              <h2 className="shop-count">{filteredProducts.length} Sản phẩm</h2>
            </div>

            {filteredProducts.length === 0 ? (

              <div className="shop-empty">
                <div className="empty-icon">📦</div>
                <h3 className="empty-title">Không tìm thấy sản phẩm</h3>
                <p className="empty-message">
                  Hãy điều chỉnh bộ lọc để xem thêm sản phẩm
                </p>
              </div>
            ) : (

              <div className="shop-products">
                {filteredProducts.map((product) => (

                  <div key={product.id} className="product-wrapper">

                    <ProductCard p={product} />
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default Shop;
