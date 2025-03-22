import { Checkbox, Radio } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AiOutlineReload } from "react-icons/ai";
import { Link } from "react-router-dom";
import { Prices } from "../components/Prices";
import { useCart } from "../context/cart";
import "../styles/Homepages.css";
import Layout from "./../components/Layout";

const HomePage = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [checked, setChecked] = useState([]);
  const [radio, setRadio] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  //get all cat
  const getAllCategory = async () => {
    try {
      const { data } = await axios.get("/api/v1/category/get-category");
      if (data?.success) {
        setCategories(data?.category);
      }
    } catch (error) {
      console.log(error);
      toast.error(`Error fetching categories: ${error.message}`);
    }
  };

  useEffect(() => {
    getTotal();
  }, [checked, radio]);

  useEffect(() => {
    getAllCategory();
  }, []);

  //get products
  const getAllProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/v1/product/product-list/${page}`);
      setLoading(false);
      console.log(data)
      setProducts(data.products);
    } catch (error) {
      setLoading(false);
      console.log(error);
      toast.error(`Error fetching product list: ${error.message}`);
    }
  };

  //getTotal Count
  const getTotal = async () => {
    try {
      const filtersApplied = { checked, radio };
      const { data } = await axios.get("/api/v1/product/product-count", {
        params: filtersApplied,
      });
      // Check for null and undefined values for total
      if (data.total !== null && data.total !== undefined) {
        setTotal(data.total);
      }
    } catch (error) {
      console.log(error);
      toast.error(`Error fetching product count: ${error.message}`);
    }
  };

  //load more
  const loadMore = async () => {
    try {
      setLoading(true);
      // If filters are applied, use filter endpoint for paginations
      if (checked.length || radio.length) {
        const { data } = await axios.post("/api/v1/product/product-filters", {
          checked,
          radio,
          page,
        });
        setLoading(false);
        setProducts((prevProducts) => [...prevProducts, ...data?.products]);
      } else {
        // Otherwise use the product-list endpoint
        const { data } = await axios.get(
          `/api/v1/product/product-list/${page}`
        );
        setLoading(false);
        setProducts((prevProducts) => [...prevProducts, ...data?.products]);
      }
    } catch (error) {
      console.log(error);
      toast.error(`Error fetching product list: ${error.message}`);
      setLoading(false);
    }
  };

  // filter by cat
  const handleFilter = (value, id) => {
    let all = [...checked];
    if (value) {
      all.push(id);
    } else {
      all = all.filter((c) => c !== id);
    }
    setChecked(all);
  };

  //get filtered product
  const filterProduct = async () => {
    try {
      const { data } = await axios.post("/api/v1/product/product-filters", {
        checked,
        radio,
      });
      setProducts(data?.products);
    } catch (error) {
      console.log(error);
      toast.error(`Error fetching filtered products: ${error.message}`);
    }
  };

  useEffect(() => {
    if (page === 1) return;
    loadMore();
  }, [page]);

  useEffect(() => {
    if (checked.length === 0 && radio.length === 0) getAllProducts();
  }, [checked, radio]);

  useEffect(() => {
    if (checked.length || radio.length) {
      filterProduct();
      setPage(1);
    }
  }, [checked, radio]);

  useEffect(() => {
    getAllCategory();
    getTotal();
  }, []);

  return (
    <Layout title={"ALL Products - Best offers "}>
      {/* banner image */}
      <img
        src="/images/Virtual.png"
        className="banner-img"
        alt="bannerimage"
        width={"100%"}
      />
      {/* banner image */}
      <div className="container-fluid row mt-3 home-page">
        <div className="col-md-3 filters">
          <h4 className="text-center">Filter By Category</h4>
          <div className="d-flex flex-column">
            {categories?.map((c) => (
              <Checkbox
                key={c._id}
                onChange={(e) => handleFilter(e.target.checked, c._id)}
              >
                {c.name}
              </Checkbox>
            ))}
          </div>
          {/* price filter */}
          <h4 className="text-center mt-4">Filter By Price</h4>
          <div className="d-flex flex-column">
            <Radio.Group onChange={(e) => setRadio(e.target.value)}>
              {Prices?.map((p, index) => (
                <Radio key={`${p._id}-${index}`} value={p.array}>
                  {p.name}
                </Radio>
              ))}
            </Radio.Group>
          </div>
          <div className="d-flex flex-column">
            <button
              className="btn btn-danger"
              onClick={() => window.location.reload()}
            >
              RESET FILTERS
            </button>
          </div>
        </div>
        <div className="col-md-9 ">
          <h1 className="text-center">All Products</h1>
          <div className="d-flex flex-wrap">
            {products?.map((p) => (
              <div
                className="card m-2"
                key={p._id}
                id={`product-card-${p.slug}`}
              >
                <img
                  src={`/api/v1/product/product-photo/${p._id}`}
                  className="card-img-top"
                  alt={p.name}
                />
                <div className="card-body">
                  <div className="card-name-price">
                    <h5 className="card-title">{p.name}</h5>
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
                        ? `${p.description.substring(0, 60)}...`
                        : p.description
                      : ""}
                  </p>
                  <div className="card-name-price">
                    <Link
                      className="btn btn-info ms-1"
                      to={`/product/${p.slug}`}
                    >
                      More Details
                    </Link>
                    <button
                      className="btn btn-dark ms-1"
                      onClick={() => addToCart(p.slug)}
                    >
                      ADD TO CART
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="m-2 p-3">
            {products && products.length < total && (
              <button
                className="btn loadmore"
                onClick={(e) => {
                  e.preventDefault();
                  setPage(page + 1);
                }}
              >
                {loading ? (
                  "Loading ..."
                ) : (
                  <>
                    {" "}
                    Loadmore <AiOutlineReload />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
