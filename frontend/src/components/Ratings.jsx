import "./Ratings.css";

const Ratings = function ({ value, text, color }) {

  const fullStars = Math.floor(value);

  const hasHalfStar = value - fullStars > 0.5 ? 1 : 0;

  const emptyStars = 5 - fullStars - hasHalfStar;

  const renderFullStars = Array.from({ length: fullStars }).map(function (
    _,
    index
  ) {
    return (
      <span key={`full-${index}`} className="star star-full">
        ★
      </span>
    );
  });

  const renderHalfStar =
    hasHalfStar === 1 ? (
      <span key="half" className="star star-half">
        ★
      </span>
    ) : null;

  const renderEmptyStars = Array.from({ length: emptyStars }).map(function (
    _,
    index
  ) {
    return (
      <span key={`empty-${index}`} className="star star-empty">
        ☆
      </span>
    );
  });

  return (
    <div className="ratings-container" style={{ "--star-color": color }}>

      <div className="ratings-stars">

        {renderFullStars}

        {renderHalfStar}

        {renderEmptyStars}
      </div>

      {text && <span className="ratings-text">{text}</span>}
    </div>
  );
};

Ratings.defaultProps = {
  color: "gold", // Default star color
  text: "", // Default no text
  value: 0, // Default 0 rating (no stars)
};

export default Ratings;
