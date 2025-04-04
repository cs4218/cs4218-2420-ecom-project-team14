import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { useCart } from "../context/cart";
import "../styles/ProductDetailsStyles.css";

const ProductDetails = () => {
  const navigate = useNavigate();

  const { addToCart } = useCart();
  const params = useParams();
  const [product, setProduct] = useState({});
  const [relatedProducts, setRelatedProducts] = useState([]);

  //getProduct
  const getProduct = async (productSlug) => {
    try {
      const { data } = await axios.get(
        `/api/v1/product/get-product/${productSlug}`
      );
      if (data.product) {
        setProduct(data.product);
        getSimilarProduct(data.product._id, data.product.category._id);
      }
    } catch (error) {
      console.log(error);
    }
  };

  //get similar product
  const getSimilarProduct = async (pid, cid) => {
    try {
      const { data } = await axios.get(
        `/api/v1/product/related-product/${pid}/${cid}`
      );

      // Set default to empty array if data is not truthy
      setRelatedProducts(data.products ?? []);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load similar products. Please try again.");
    }
  };

  useEffect(() => {
    if (params.slug) {
      getProduct(params.slug);
    }
  }, [params]);

  return (
    <Layout>
      <div className="row container product-details">
        <div className="col-md-6">
          <img
            src={`/api/v1/product/product-photo/${product._id}`}
            className="card-img-top"
            alt={product.name ?? "General Product"}
            height="300"
            width={"350px"}
          />
        </div>
        <div className="col-md-6 product-details-info">
          <h1 className="text-center">Product Details</h1>
          <hr />
          <h6>Name : {product.name ?? "Name not found"}</h6>
          <h6>
            Description : {product.description ? product.description : ""}
          </h6>
          <h6>
            Price :
            {product?.price
              ? product.price.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })
              : "Price not found"}
          </h6>
          <h6>Category : {product.category?.name ?? "Category not found"}</h6>
          <button
            className="btn btn-secondary ms-1"
            onClick={() => addToCart(product.slug)}
          >
            ADD TO CART
          </button>
        </div>
      </div>
      <hr />
      <div className="row container similar-products">
        <h4>Similar Products ➡️</h4>
        {relatedProducts.length < 1 && (
          <p className="text-center">No Similar Products found</p>
        )}
        <div className="d-flex flex-wrap">
          {relatedProducts.map((p) => (
            <div
              className="card m-2 relatedProductCard"
              key={p._id}
              id={`related-product-card-${p.slug}`}
            >
              <img
                src={`/api/v1/product/product-photo/${p._id}`}
                className="card-img-top"
                alt={p.name ?? "No name found"}
              />
              <div className="card-body">
                <div className="card-name-price">
                  <h5 className="card-title">{p.name ?? "Name not found"}</h5>
                  <h5 className="card-title card-price">
                    {p.price
                      ? p.price.toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })
                      : "Price not found"}
                  </h5>
                </div>
                <p className="card-text ">
                  {p.description
                    ? p.description.length > 60
                      ? p.description.substring(0, 60) + "..."
                      : p.description
                    : ""}
                </p>
                <div className="card-name-price">
                  <button
                    className="btn btn-info ms-1"
                    onClick={() => navigate(`/product/${p.slug}`)}
                  >
                    More Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetails;
