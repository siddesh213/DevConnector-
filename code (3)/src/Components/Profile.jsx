import { useSelector } from "react-redux";
import ProfileCard from "./ProfileView.jsx";
import { useNavigate } from "react-router-dom";

const ProfileView = () => {
  const user = useSelector((store) => store.user);
  const navigate = useNavigate();

  if (!user) return <h2 className="text-center mt-10">Loading...</h2>;

  return (
    <div className="flex flex-col items-center my-10 gap-4">
      <ProfileCard user={user} />

      <button
        className="btn btn-primary"
        onClick={() => navigate("/profile/edit")}
      >
        Edit Profile
      </button>
    </div>
  );
};

export default ProfileView;
