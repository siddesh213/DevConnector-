"use client";

import axios from "axios";
import { useEffect } from "react";
import { API_BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addFeed } from "../utils/feedSlice";
import UserCard from "./UserCard";
import { useNavigate } from "react-router-dom";

const Feed = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const feed = useSelector((store) => store.feed);
  const user = useSelector((store) => store.user);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const getFeed = async () => {
      try {
        const res = await axios.get(API_BASE_URL + "/feed", {
          withCredentials: true,
        });

        console.log("FEED RESPONSE:", res.data); // ✅ Check the array
        dispatch(addFeed(res.data.users)); // ✅ Feed is res.data.users
      } catch (err) {
        console.log("Feed Error:", err);
      }
    };

    getFeed();
  }, []);

  if (!feed) return <h2 className="text-center mt-20">Loading...</h2>;

  return (
    <div className="flex flex-col items-center gap-6 my-10">
      {feed.length > 0 ? (
        feed.map((person) => <UserCard key={person._id} user={person} />)
      ) : (
        <h1 className="text-3xl font-bold text-gray-500 mt-20">
          No new developers available right now.
        </h1>
      )}
    </div>
  );
};

export default Feed;
