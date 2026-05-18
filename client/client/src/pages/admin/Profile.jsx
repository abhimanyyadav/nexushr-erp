import "./Profile.css";

const Profile = () => {
  return (
    <div className="profile-page">
      <h2>Profile Settings</h2>

      <div className="card">
        <h3>Personal Info</h3>

        <input placeholder="First Name" />
        <input placeholder="Last Name" />
        <input placeholder="Email" />

        <textarea placeholder="Bio" />

        <button className="btn-primary">Save Changes</button>
      </div>
    </div>
  );
};

export default Profile;