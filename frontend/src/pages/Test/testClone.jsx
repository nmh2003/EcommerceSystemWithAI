import React from "react";
import "./Test.css";
import { useState } from "react";
import { useEffect } from "react";

const Test = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:1337/api/articles");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setArticles(data);
      } catch (error) {
        console.error("Error fetching articles:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) {
    return <div className="main">Loading articles...</div>;
  }

  if (error) {
    return <div className="main">Error: {error}</div>;
  }

  return (
    <div className="main">
      <h2>Articles Test</h2>
      <ul>
        {articles.map((article) => (
          <li key={article.id}>
            <strong>{article.title}</strong>: {article.content}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Test;
