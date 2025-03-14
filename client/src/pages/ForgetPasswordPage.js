import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ForgetPassword = () => {
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [answer, setAnswer] = useState('');
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const validateData = () => {
        let errors = {};

        // Check that the email follows the correct format
        const emailRegex = /^(?!^\.)(?!.*\.@)(?!.*\.{2})[a-zA-Z0-9.]{1,64}@(?!@\.)(?!.*\.$)(?!.*\.{2})[a-zA-Z0-9.]{1,64}$/;    
        if (!email.match(emailRegex)) {
          errors.email = `The email is in an invalid format. It should follow the below specifications:
            Local part
            1) Cannot start with dot
            2) Cannot have consecutive dots
            3) Cannot end with dot
            4) Restrict characters to alphanumeric and dot
            5) Maximally is 64 characters long
            
            Domain part
            1) Cannot start with dot
            2) Cannot have consecutive dots
            3) Cannot end with dot
            4) Restrict characters to alphanumeric and dot
            5) Maximally is 64 characters long
          `;
        }

        // Check that new password length is at least of length 6
        if (newPassword.length < 6) {
            errors.newPassword = "The length of the new password needs to be at least of length 6";
        }

        // Check that the length of the answer is at most 100 characters long
        if (answer.length > 100) {
            errors.answer = "The length of the answer can only be up to 100 characters";
        }
        return errors
  
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrors({});
        const errorList = validateData();

        if (Object.entries(errorList).length > 0) {
            setErrors(errorList);
            toast.error("There are invalid fields in the Forget Password Form")
            return;
        }
        try {
            const response = await axios.post("/api/v1/auth/forgot-password", {
                email, newPassword, answer
            });
            if (response && response.data.success) {
                toast.success("Password has been successfully resetted");
                navigate("/login");
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error("An error has been encountered");
        }
    };

    useEffect(() => {}, []);

    // Followed a similar format as the register page to create the form
    return (<div>
        <Layout title={"Forget Password"}>
            <div className="form-container" style={{ minHeight: "90vh" }}>
                <form onSubmit={handleSubmit}>
                    <h2 className="title mb-4">Forget Password</h2>
                    <div className="mb-4">
                        <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="form-control"
                        required
                        autoFocus
                        >
                        </input>
                        {errors.email && (
                        <p style={{ color: "red", whiteSpace: "pre-line" }}>
                           {errors.email}
                        </p>
                        )}
                    </div>
                    <div className="mb-4">
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter your new password"
                            className="form-control"
                            required
                            >
                        </input>
                        {errors.newPassword && (
                        <p style={{ color: "red" }}>
                            {errors.newPassword}
                        </p>
                        )}
                    </div>
                    <div className="mb-4">
                    <input
                            type="text"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="Enter your favourite sports"
                            className="form-control"
                            required
                            >
                        </input>
                        {errors.answer && (
                        <p style={{ color: "red" }}>
                            {errors.answer}
                        </p>
                        )}
                    </div>
                    <button type="submit" className="btn btn-primary mt-3">
                        Reset Password
                    </button>
                </form>
            </div>
        </Layout>
    </div>)
};

export default ForgetPassword; 