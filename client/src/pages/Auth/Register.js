import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import "../../styles/AuthStyles.css";
import Layout from "./../../components/Layout";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [answer, setAnswer] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateFormData = () => {
    let errors = {};

    // Add validation for name (Maximum 150 characters long)
    if (name.length > 150) {
      errors.name = true;
    }

    // Add validation for password length (Need to be minimum of length 6)
    if (password.length < 6) {
      errors.password = true;
    }

    const emailRegex =
      /^(?!^\.)(?!.*\.@)(?!.*\.{2})[a-zA-Z0-9.]{1,64}@(?!@\.)(?!.*\.$)(?!.*\.{2})[a-zA-Z0-9.]{1,64}$/;
    if (!email.match(emailRegex)) {
      errors.email = true;
    }

    // Add validation for phone number
    const phoneRegex = /^[689]\d{7}$/;
    if (!phone.match(phoneRegex)) {
      errors.phone = true;
    }

    // Add validation for address
    if (address.length > 150) {
      errors.address = true;
    }

    // Add validation for answer
    if (answer.length > 100) {
      errors.answer = true;
    }
    return errors;
  };

  // form function
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateFormData();
    if (errors.keys().length > 0) {
      setErrors(errors);
      return;
    }

    try {
      const res = await axios.post("/api/v1/auth/register", {
        name,
        email,
        password,
        phone,
        address,
        answer,
      });
      if (res && res.data.success) {
        toast.success("Register Successfully, please login");
        navigate("/login");
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {}, []);

  return (
    <Layout title="Register - Ecommerce App">
      <div className="form-container" style={{ minHeight: "90vh" }}>
        <form onSubmit={handleSubmit}>
          <h4 className="title">REGISTER FORM</h4>
          <div className="mb-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-control"
              id="exampleInputName1"
              placeholder="Enter Your Name"
              required
              autoFocus
            />
            {errors.name && (
              <p style={{ color: "red" }}>
                The name can only be up to 150 characters long
              </p>
            )}
          </div>
          <div className="mb-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              id="exampleInputEmail1"
              placeholder="Enter Your Email "
              required
            />
            {errors.email && (
              <p style={{ color: "red" }}>The email is not valid</p>
            )}
          </div>
          <div className="mb-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              id="exampleInputPassword1"
              placeholder="Enter Your Password"
              required
            />
            {errors.name && (
              <p style={{ color: "red" }}>
                The password must be more than 6 characters long
              </p>
            )}
          </div>
          <div className="mb-3">
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="form-control"
              id="exampleInputPhone1"
              placeholder="Enter Your Phone"
              required
            />
            {errors.name && (
              <p style={{ color: "red" }}>
                The phone number is not valid. The phone number must start with
                6,8 or 9 and be 8 digits long
              </p>
            )}
          </div>
          <div className="mb-3">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="form-control"
              id="exampleInputaddress1"
              placeholder="Enter Your Address"
              required
            />
            {errors.name && (
              <p style={{ color: "red" }}>
                The address can only be up to 150 characters long
              </p>
            )}
          </div>
          <div className="mb-3">
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="form-control"
              id="exampleInputanswer1"
              placeholder="What is Your Favorite sports"
              required
            />
            {errors.name && (
              <p style={{ color: "red" }}>
                The answer can only be up to 100 characters long
              </p>
            )}
          </div>
          <button type="submit" className="btn btn-primary">
            REGISTER
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default Register;
