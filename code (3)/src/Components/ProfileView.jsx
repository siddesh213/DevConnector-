"use client";

import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const ProfileView = () => {
  const user = useSelector((store) => store.user);

  if (!user) return <h2 className="text-center mt-20">Loading...</h2>;

  return (
    <div className="flex justify-center my-10">
      <div className="card bg-base-300 w-96 shadow-xl">
        <figure className="p-4">
          <img
            src={user.PhotoUrl || "/placeholder.svg"}
            alt="Profile"
            className="rounded-lg w-48 h-48 object-cover border"
          />
        </figure>

        <div className="card-body text-center">
          <h2 className="text-2xl font-bold">
            {user.FirstName} {user.LastName}
          </h2>

          {user.Age && user.Gender && (
            <p className="text-gray-500">{user.Age} • {user.Gender}</p>
          )}

          {user.About && (
            <p className="text-sm text-gray-300 mt-2">{user.About}</p>
          )}

          {user.Skills?.length > 0 && (
            <div className="mt-3">
              <h3 className="text-gray-200 text-xs uppercase font-bold">Skills</h3>
              <div className="flex gap-2 flex-wrap justify-center mt-1">
                {user.Skills.map((skill, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-600 rounded-full text-xs text-white">
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="card-actions justify-center mt-4">
            <Link to="/profile/edit" className="btn btn-primary">
              Edit Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
