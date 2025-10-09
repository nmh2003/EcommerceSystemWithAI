import { useState, useEffect } from "react";

import Loader from "./Loader";
import Message from "./Message";
import SmallProduct from "./SmallProduct";
import ProductCarousel from "./ProductCarousel";

import "./Header.css";

const Header = () => {

  const [topProducts, setTopProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {

    const fetchTopProducts = async () => {
      try {

        setLoading(true);

        setError("");

        const response = await fetch("http://localhost:1337/api/products/top");

        if (!response.ok) {
          throw new Error("Failed to fetch top products");
        }

        const data = await response.json();

        setTopProducts(data.slice(0, 4));
      } catch (err) {
        console.error("Fetch top products error:", err);
        setError(err.message || "Something went wrong");
      } finally {

        setLoading(false);
      }
    };

    fetchTopProducts();
  }, []); // Empty dependency array

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <Message variant="error">{error}</Message>;
  }

  return (
    <>

      <div className="header-main-flex">

        <div className="header-left-grid">

          <div className="header-top-products-grid">

            {topProducts.map((product) => (
              <div key={product.id} className="header-top-product-wrapper">

                <SmallProduct product={product} />
              </div>
            ))}
          </div>
        </div>

        <div className="header-carousel">
          <ProductCarousel />
        </div>
      </div>
    </>
  );
};

export default Header;
