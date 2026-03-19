"use client";

import axios from "axios";
import { API_BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { removeUserFromFeed } from "../utils/feedSlice";

const UserCard = ({ user }) => {
  const dispatch = useDispatch();

  // ✅ FIX: match backend field names
  const {
    _id,
    FirstName,
    LastName,
    Age,
    Gender,
    About,
    Skills,
    PhotoUrl,
  } = user;

  const handleSendRequest = async (status, userId) => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/sendconnection/${status}/${userId}`,
        {},
        { withCredentials: true }
      );
      dispatch(removeUserFromFeed(userId));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="card bg-gradient-to-br from-slate-800 to-slate-900 w-96 shadow-2xl p-4 border border-slate-700 hover:shadow-2xl transition-all duration-300">
      <figure className="relative overflow-hidden rounded-lg">
        <img
          src={PhotoUrl || "/placeholder.svg"} // ✅ FIX field name
          alt={FirstName}
          className="w-full h-80 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      </figure>

      <div className="card-body p-4">
        <h2 className="card-title text-2xl font-bold text-white">
          {FirstName} {LastName}
        </h2>

        {Age && Gender && (
          <p className="text-slate-400 text-sm">
            {Age} • {Gender}
          </p>
        )}

        <p className="text-slate-300 text-sm line-clamp-2">{About}</p>

        {/* ✅ Skills display fix */}
        {Skills?.length > 0 && (
          <div>
            <h3 className="font-semibold text-slate-200 text-xs uppercase mt-3">
              Skills
            </h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {Skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-md"
                >
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="card-actions justify-center gap-2 my-4">
          <button
            className="btn btn-outline btn-error px-6 hover:bg-red-600 hover:text-white transition-all"
            onClick={() => handleSendRequest("ignored", _id)}
          >
            ❌ Ignore
          </button>

          <button
            className="btn bg-gradient-to-r from-green-500 to-emerald-600 border-none text-white px-6 hover:shadow-lg transition-all"
            onClick={() => handleSendRequest("interested", _id)}
          >
            ❤️ Interested
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
