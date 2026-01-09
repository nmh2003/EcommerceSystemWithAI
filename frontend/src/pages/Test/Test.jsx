import React from "react";
import "./Test.css";
import { useState } from "react";
import { useEffect } from "react";
const Test = () => {
  const [articles, setArticles] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:1337/api/articles");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setArticles(data);
      } catch (error) {
        setError(error.message);
        setArticles("Error loading content");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, []);
  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error}</div>;
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
