"use client";

import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import axios from "axios";
import { API_BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useEffect, useState } from "react";

const Body = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((store) => store.user);
  const [loading, setLoading] = useState(true); // ✅ local loading state

  const fetchUser = async () => {
    try {
      const res = await axios.get(API_BASE_URL + "/profile/view", {
        withCredentials: true,
      });

      dispatch(addUser(res.data));
      setLoading(false); // ✅ User loaded
    } catch (err) {
      setLoading(false); // ✅ Done loading
      navigate("/login"); // ✅ Not logged in -> go to login page
    }
  };

  useEffect(() => {
    fetchUser(); // ✅ Always try fetching once
  }, []);

  if (loading) {
    return (
      <h2 className="text-center mt-20 text-lg text-gray-400">
        Loading...
      </h2>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="pt-20">
        <Outlet /> {/* ✅ Render Feed or any page */}
      </div>
      <Footer />
    </div>
  );
};

export default Body;
