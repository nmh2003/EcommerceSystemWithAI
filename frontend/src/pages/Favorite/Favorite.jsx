import { useFavorite } from "../../context/FavoriteContext";
import Product from "../../components/Product";

function Favorite() {

  const { favorites } = useFavorite();

  return (

    <div style={{ marginLeft: "5rem" }}>

      <h1
        style={{
          fontSize: "1.125rem", // text-lg
          fontWeight: "bold", // font-bold
          marginLeft: "3rem", // ml-[3rem]
          marginTop: "0rem", // mt-[3rem]
        }}
      >
        SẢN PHẨM YÊU THÍCH
      </h1>

      <div style={{ display: "flex", flexWrap: "wrap" }}>

        {favorites.map((product) => (
          <Product key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

export default Favorite;
