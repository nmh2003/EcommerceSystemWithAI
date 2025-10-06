import "./Loader.css";

function Loader({ size = "medium", message = "" }) {

  const loaderClass = `loader loader-${size}`;

  return (
    <div className="loader-container">

      <div className={loaderClass}></div>

      {message && <p className="loader-message">{message}</p>}
    </div>
  );
}

export default Loader;
