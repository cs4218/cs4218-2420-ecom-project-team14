import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "./../components/Layout";

const Pagenotfound = () => {
  // Update document title directly for SEO purposes when component is rendered
  useEffect(() => {
    const originalTitle = document.title;

    document.title = "404 - Page Not Found | Ecommerce App";

    // Cleanup function for when component unmounts by resetting document title
    return () => {
      document.title = originalTitle;
    };
  }, []);

  return (
    <Layout title={"go back- page not found"}>
      {/* Accessibility feature for assitive devices to show user 404 when page not found. */}
      <div className="pnf" role="alert" aria-labelledby="pnf-heading">
        <h1 id="error-title" className="pnf-title">
          404
        </h1>
        <h2 className="pnf-heading">Oops ! Page Not Found</h2>
        <Link to="/" className="pnf-btn">
          Go Back
        </Link>
      </div>
    </Layout>
  );
};

export default Pagenotfound;
