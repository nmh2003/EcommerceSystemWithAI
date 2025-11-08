import { useState, useEffect } from "react";

import { Link } from "react-router-dom";

import Product from "../components/Product";

import "./Favorites.css";

function Favorites() {

  const [favorites, setFavorites] = useState([]);

  useEffect(function () {

    const storedFavorites = localStorage.getItem("favorites");

    if (storedFavorites) {

      const parsedFavorites = JSON.parse(storedFavorites);

      if (Array.isArray(parsedFavorites)) {

        setFavorites(parsedFavorites);
      }
    }
  }, []); // Dependencies array rỗng → Chỉ chạy 1 lần khi mount

  return (
    <div className="favorites-page">

      <div className="favorites-container">

        <h1 className="favorites-heading">FAVORITE PRODUCTS</h1>

        {favorites.length === 0 ? (

          <div className="favorites-empty">
            <p className="favorites-empty-text">No favorite products yet.</p>
            <p className="favorites-empty-subtext">
              Click the heart icon on products to add them to your favorites!
            </p>

            <Link to="/shop" className="favorites-empty-link">
              Go to Shop
            </Link>
          </div>
        ) : (

          <div className="favorites-grid">

            {favorites.map(function (product) {
              return (

                <Product key={product.id} product={product} />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Favorites;
