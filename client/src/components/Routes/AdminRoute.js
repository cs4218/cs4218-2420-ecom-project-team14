import React from "react";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import Spinner from "../Spinner";

export default function AdminRoute() {
  const [auth, setAuth] = useAuth();
  const token = useMemo(() => auth?.token, [auth]); // Avoid unnecessary re-renders
  const [state, setState] = useState({ loading: true, ok: false });
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      if (!auth?.token) {
        const storedAuth = localStorage.getItem("auth");
        if (storedAuth) {
          const parsedAuth = JSON.parse(storedAuth);
          setAuth(parsedAuth);
          const token = parsedAuth.token;

          try {
            const response = await axios.get("/api/v1/auth/admin-auth", {
              headers: {
                Authorization: token,
              },
            });

            setState({ loading: false, ok: response.data.ok });
          } catch (error) {
            if (error.response) {
              // Failed token authorization check
              navigate("/forbidden");
            } else {
              // Potentially network error
              navigate("/login");
            }
          }
        } else {
          // No token in local storage and in auth context
          navigate("/login");
        }
      } else {
        try {
          const response = await axios.get("/api/v1/auth/admin-auth", {
            headers: {
              Authorization: token,
            },
          });
          setState({ loading: false, ok: response.data.ok });
        } catch (error) {
          if (error.response) {
            // Failed token authorization check
            navigate("/forbidden");
          } else {
            // Potentially network error
            navigate("/login");
          }
        }
      }
    };
    checkAuth();
  }, [auth?.token, token, navigate, setAuth]);

  return state.loading ? <Spinner /> : <Outlet />;
}
