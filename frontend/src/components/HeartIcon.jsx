import { FaHeart, FaRegHeart } from "react-icons/fa";

import { useFavorite } from "../context/FavoriteContext";

import "./HeartIcon.css";

function HeartIcon({ product }) {

  const { isFavorite, toggleFavorite } = useFavorite();

  const isFav = isFavorite(product.id);

  function toggleFavorites() {
    toggleFavorite(product);
  }

  return (
    <div

      className="heart-icon"

      onClick={toggleFavorites}
    >

      {isFav ? (

        <FaHeart className="heart-icon-filled" />
      ) : (

        <FaRegHeart className="heart-icon-outline" />
      )}
    </div>
  );
}

export default HeartIcon;
