"use client";

import { useState } from "react";
import UserCard from "./UserCard";
import axios from "axios";
import { API_BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";

const EditProfile = ({ user }) => {
  const dispatch = useDispatch();

  const [firstName, setFirstName] = useState(user?.FirstName || "");
  const [lastName, setLastName] = useState(user?.LastName || "");
  const [age, setAge] = useState(user?.Age || "");
  const [gender, setGender] = useState(user?.Gender || "");
  const [about, setAbout] = useState(user?.About || "");
  const [skills, setSkills] = useState(user?.Skills || []);

  // ✅ Step 3: File state added
  const [selectedFile, setSelectedFile] = useState(null);

  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);

  const saveProfile = async () => {
    setError("");

    try {
      // ✅ Step 4: Upload image first (if selected)
      if (selectedFile) {
        const formData = new FormData();
        formData.append("photo", selectedFile);

        const uploadRes = await axios.post(
          API_BASE_URL + "/profile/upload",
          formData,
          {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        dispatch(addUser(uploadRes.data.data));
      }

      // ✅ Update other details
      const payload = {
        FirstName: firstName,
        LastName: lastName,
        Age: age,
        Gender: gender?.toLowerCase(),
        About: about,
        Skills: skills,
      };

      const res = await axios.patch(API_BASE_URL + "/profile/edit", payload, {
        withCredentials: true,
      });

      dispatch(addUser(res.data.data));

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      setError(err?.response?.data || "Profile update failed");
    }
  };

  return (
    <>
      <div className="flex justify-center my-10 max">
        <div className="flex justify-center mx-10">
          <div className="card bg-base-300 w-96 shadow-xl">
            <div className="card-body">
              <h2 className="card-title justify-center">Edit Profile</h2>

              {/* ✅ Upload Profile Photo */}
              <label className="form-control w-full max-w-xs my-2">
                <span className="label-text">Profile Photo</span>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  className="file-input file-input-bordered w-full max-w-xs"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                />
              </label>

              {/* First Name */}
              <label className="form-control w-full max-w-xs my-2">
                <span className="label-text">First Name</span>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="input input-bordered w-full max-w-xs"
                />
              </label>

              {/* Last Name */}
              <label className="form-control w-full max-w-xs my-2">
                <span className="label-text">Last Name</span>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="input input-bordered w-full max-w-xs"
                />
              </label>

              {/* Age */}
              <label className="form-control w-full max-w-xs my-2">
                <span className="label-text">Age</span>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="input input-bordered w-full max-w-xs"
                />
              </label>

              {/* Gender */}
              <label className="form-control w-full max-w-xs my-2">
                <span className="label-text">Gender</span>
                <select
                  className="select select-bordered w-full max-w-xs"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option disabled value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </label>

              {/* Skills */}
              <label className="form-control w-full max-w-xs my-2">
                <span className="label-text">Skills (comma separated)</span>
                <input
                  type="text"
                  value={skills.join(",")}
                  onChange={(e) => setSkills(e.target.value.split(","))}
                  className="input input-bordered w-full max-w-xs"
                />
              </label>

              {/* About */}
              <label className="form-control w-full max-w-xs my-2">
                <span className="label-text">About</span>
                <textarea
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  className="textarea textarea-bordered w-full max-w-xs"
                ></textarea>
              </label>

              {error && <p className="text-red-500 text-center">{error}</p>}

              <div className="card-actions justify-center mt-2">
                <button className="btn btn-primary" onClick={saveProfile}>
                  Save Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Live Preview (temporary - fix in Step-5) */}
       
      </div>

      {showToast && (
        <div className="toast toast-top toast-center pt-20">
          <div className="alert alert-success">
            <span>✅ Profile saved successfully</span>
          </div>
        </div>
      )}
    </>
  );
};

export default EditProfile;
