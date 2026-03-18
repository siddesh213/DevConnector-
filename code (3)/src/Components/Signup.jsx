"use client";

import axios from "axios";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../utils/constants";

const Signup = () => {
  const [emailId, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validate = () => {
    if (!emailId || !password || !firstName || !lastName) {
      setError("Please fill all required fields");
      return false;
    }
    return true;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        API_BASE_URL + "/signup",
        {
          FirstName: firstName,
          LastName: lastName,
          EmailId: emailId,
          PassWord: password,
        },
        { withCredentials: true }
      );

      dispatch(addUser(res.data.user));
      navigate("/feed");
    } catch (err) {
      setError(err?.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center my-10">
      <div className="card bg-base-300 w-96 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center">Signup</h2>

          <div>
            <label className="form-control w-full max-w-xs my-2">
              <span className="label-text">First Name</span>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="input input-bordered w-full max-w-xs"
              />
            </label>

            <label className="form-control w-full max-w-xs my-2">
              <span className="label-text">Last Name</span>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input input-bordered w-full max-w-xs"
              />
            </label>

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
              onClick={handleSignup}
              disabled={loading}
            >
              {loading ? "Please wait..." : "Signup"}
            </button>
          </div>

          <p className="text-center py-2">
            Already have an account?{" "}
            <span
              className="text-blue-500 cursor-pointer"
              onClick={() => navigate("/login")}
            >
              Login here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;