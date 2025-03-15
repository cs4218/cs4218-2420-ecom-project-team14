import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "./../components/Layout";

const Forbiddenpage = () => {
  // Update document title directly for SEO purposes when component is rendered
  useEffect(() => {
    const originalTitle = document.title;

    document.title = "401 - Forbidden Page | Ecommerce App";

    // Cleanup function for when component unmounts by resetting document title
    return () => {
      document.title = originalTitle;
    };
  }, []);

  return (
    <Layout title={"go back- forbidden page"}>
      {/* Accessibility feature for assitive devices to show user 401 when page not found. */}
      <div className="pnf" role="alert" aria-labelledby="pnf-heading">
        <h1 id="error-title" className="pnf-title">
          401
        </h1>
        <h2 className="pnf-heading">Oops ! This Page is forbidden</h2>
        <Link to="/" className="pnf-btn">
          Go Back
        </Link>
      </div>
    </Layout>
  );
};

export default Forbiddenpage;
