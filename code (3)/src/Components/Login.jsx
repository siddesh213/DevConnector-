"use client";

import axios from "axios";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../utils/constants";

const Login = () => {
  const [emailId, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validate = () => {
    if (!emailId || !password) {
      setError("Please fill all required fields");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        API_BASE_URL + "/login",
        { EmailId: emailId, PassWord: password },
        { withCredentials: true }
      );

      dispatch(addUser(res.data.user));
      navigate("/feed");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center my-10">
      <div className="card bg-base-300 w-96 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center">Login</h2>

          <div>
            <label className="form-control w-full max-w-xs my-2">
              <span className="label-text">Email</span>
              <input
                type="email"
                value={emailId}
                onChange={(e) => setEmail(e.target.value)}
                className="input input-bordered w-full max-w-xs"
              />
            </label>

            <label className="form-control w-full max-w-xs my-2">
              <span className="label-text">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input input-bordered w-full max-w-xs"
              />
            </label>
          </div>

          {error && <p className="text-red-600 text-center">{error}</p>}

          <div className="card-actions justify-center mt-3">
            <button
              className="btn btn-primary"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Please wait..." : "Login"}
            </button>
          </div>

          <p className="text-center py-2">
            New user?{" "}
            <span
              className="text-blue-500 cursor-pointer"
              onClick={() => navigate("/signup")}
            >
              Signup here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
