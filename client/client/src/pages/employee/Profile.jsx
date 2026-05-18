import { useEffect, useState } from "react";
import "./Profile.css";

function Profile() {

  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);



  // ================= FETCH USER =================

  useEffect(() => {

    const fetchUser = async () => {

      try {

        const res = await fetch(
          (window.API_BASE_URL || (window.API_BASE_URL || "http://localhost:8080")) + "/api/auth/me",
          {
            credentials: "include",
          }
        );

        const data = await res.json();

        setUser(data);

        setForm({
          name: data.name || "",
          email: data.email || "",
        });

      } catch (err) {

        console.log("Error fetching user:", err);

      } finally {

        setLoading(false);

      }

    };

    fetchUser();

  }, []);



  // ================= HANDLE CHANGE =================

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  };



  // ================= FILE SELECT =================

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };



  // ================= UPDATE PROFILE =================

  const handleUpdate = async () => {

    setUpdating(true);

    try {

      // 🔹 Update Name + Email

      const res = await fetch(
        (window.API_BASE_URL || (window.API_BASE_URL || "http://localhost:8080")) + "/api/auth/update-profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!res.ok) {

        alert(data.message || "Update failed");
        setUpdating(false);
        return;

      }

      // 🔹 Upload Profile Photo

      if (selectedFile) {

        const formData = new FormData();

        formData.append("profilePic", selectedFile);

        const photoRes = await fetch(
          (window.API_BASE_URL || (window.API_BASE_URL || "http://localhost:8080")) + "/api/auth/update-profile-photo",
          {
            method: "PUT",
            credentials: "include",
            body: formData,
          }
        );

        const photoData = await photoRes.json();

        if (photoRes.ok) {

          setUser(prev => ({
            ...prev,
            profilePic: photoData.profilePic
          }));

        }

      }

      // 🔹 Update UI

      setUser(prev => ({
        ...prev,
        name: form.name,
        email: form.email,
      }));

      alert("Profile updated successfully ✅");

      setSelectedFile(null);
      setPreview(null);

    } catch (err) {

      console.log("Update error:", err);

      alert("Something went wrong");

    }

    setUpdating(false);

  };



  // ================= CANCEL =================

  const handleCancel = () => {

    setForm({
      name: user.name,
      email: user.email,
    });

    setSelectedFile(null);
    setPreview(null);

  };



  // ================= UI =================

  if (loading) return <p>Loading profile...</p>;

  if (!user) return <p>No user found</p>;



  return (

    <div className="profile-container">

      <h2 className="page-title">
        Account Settings
      </h2>



      <div className="profile-grid">

        {/* PROFILE CARD */}

        <div className="card profile-card">

          <img
            src={
              preview ||
              (user.profilePic 
                ? (user.profilePic.startsWith("http") ? user.profilePic : (window.API_BASE_URL || (window.API_BASE_URL || "http://localhost:8080")) + `/uploads/${user.profilePic}`)
                : "https://via.placeholder.com/100")
            }
            alt="profile"
            className="avatar"
          />

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />

          <h3>{user.name}</h3>

          <p>
            {user.role || "Employee"}
          </p>

        </div>



        {/* FORM */}

        <div className="card form-card">

          <h3>
            Personal Information
          </h3>



          <div className="row">

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full Name"
            />

            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
            />

          </div>



          <div className="row">
            <div className="info-group">
              <label>Role</label>
              <input value={user.role} readOnly />
            </div>
            <div className="info-group">
              <label>Department</label>
              <input value={user.department || "Not Assigned"} readOnly />
            </div>
          </div>

          <div className="row">
            <div className="info-group">
              <label>Employee ID</label>
              <input value={user.employeeId || "N/A"} readOnly />
            </div>
            <div className="info-group">
              <label>Joining Date</label>
              <input value={user.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : "N/A"} readOnly />
            </div>
          </div>

          <div className="row">
            <div className="info-group">
              <label>Phone</label>
              <input value={user.phone || "N/A"} readOnly />
            </div>
            <div className="info-group">
              <label>Address</label>
              <textarea value={user.address || "N/A"} readOnly />
            </div>
          </div>



          <div className="actions">

            <button
              className="btn secondary"
              onClick={handleCancel}
            >
              Cancel
            </button>



            <button
              className="btn primary"
              onClick={handleUpdate}
              disabled={updating}
            >
              {updating
                ? "Updating..."
                : "Update"}
            </button>

          </div>

        </div>

      </div>

    </div>

  );

}

export default Profile;