import { useEffect, useState } from "react";
import "./ManageEmployees.css";

const ManageEmployees = () => {

  // ================= STATES =================

  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [isEdit, setIsEdit] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    salary: "",
    bonus: "",
    employeeId: "",
    phone: "",
    address: ""
  });

  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);

  // ================= FETCH =================

  const fetchEmployees = () => {
    fetch("http://localhost:8080/api/auth/employee", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => setEmployees(data))
      .catch(err => console.log("Fetch error:", err));
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // ================= IMAGE HANDLE =================

  const handleImage = (e) => {
    const file = e.target.files[0];

    if (file) {
      setProfilePic(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // ================= FILTER =================

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(search.toLowerCase())
  );

  // ================= STATS =================

  const totalEmployees = employees.length;

  const departments = [
    ...new Set(employees.map(emp => emp.department))
  ].length;

  const avgSalary =
    employees.length > 0
      ? Math.round(
          employees.reduce((sum, emp) => sum + (emp.salary || 0), 0) /
            employees.length
        )
      : 0;

  // ================= MODAL HANDLERS =================

  const openEditModal = (emp) => {
    setIsEdit(true);
    setSelectedEmployee(emp);

    setForm({
      name: emp.name || "",
      email: emp.userId?.email || "",
      department: emp.department || "",
      salary: emp.salary || "",
      bonus: emp.bonus || "",
      employeeId: emp.employeeId || "",
      phone: emp.phone || "",
      address: emp.address || ""
    });

    setShowModal(true);
  };

  const openAddModal = () => {
    setIsEdit(false);
    setForm({
      name: "",
      email: "",
      department: "",
      salary: "",
      bonus: "",
      employeeId: "",
      phone: "",
      address: ""
    });

    setProfilePic(null);
    setPreview(null);

    setShowModal(true);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // ================= ADD EMPLOYEE =================

  const handleAddEmployee = async () => {
    try {
      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("department", form.department);
      formData.append("salary", form.salary);
      formData.append("bonus", form.bonus);
      formData.append("employeeId", form.employeeId);
      formData.append("phone", form.phone);
      formData.append("address", form.address);

      if (profilePic) {
        formData.append("profilePic", profilePic);
      }

      const res = await fetch(
        "http://localhost:8080/api/auth/employee",
        {
          method: "POST",
          body: formData,
          credentials: "include"
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("Employee added ✅");
        setShowModal(false);
        fetchEmployees();
      } else {
        alert(data.message);
      }

    } catch (err) {
      console.log("Add error:", err);
    }
  };

  // ================= UPDATE =================

  const handleUpdate = async () => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/auth/employee/${selectedEmployee._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({
            department: form.department,
            salary: Number(form.salary),
            bonus: Number(form.bonus),
            phone: form.phone,
            address: form.address
          })
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("Employee updated ✅");
        setShowModal(false);
        fetchEmployees();
      } else {
        alert(data.message);
      }

    } catch (err) {
      console.log("Update error:", err);
    }
  };

  // ================= DELETE =================

  const handleDelete = async (employeeId) => {
    if (!window.confirm("Delete this employee?")) return;

    try {
      const res = await fetch(
        `http://localhost:8080/api/auth/employee/${employeeId}`,
        {
          method: "DELETE",
          credentials: "include"
        }
      );

      if (res.ok) {
        alert("Deleted ✅");
        fetchEmployees();
      }

    } catch (err) {
      console.log(err);
    }
  };

  // ================= UI =================

  return (
    <div className="manage-page">

      {/* HEADER */}
      <div className="header">
        <h2>Manage Employees</h2>

        <button className="btn primary" onClick={openAddModal}>
          + Add Employee
        </button>
      </div>

      {/* STATS */}
      <div className="stats">
        <div className="card">Total Employees: {totalEmployees}</div>
        <div className="card">Departments: {departments}</div>
        <div className="card">Avg Salary: ₹{avgSalary}</div>
      </div>

      {/* TABLE */}
      <div className="card">

        <div className="table-header">
          <h3>Employee Directory</h3>

          <input
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Salary</th>
                <th>Bonus</th>
                <th>Total Deduction</th>
                <th>Net Salary</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.map(emp => (
                <tr key={emp._id}>
                  <td>{emp.name}</td>
                  <td>{emp.userId?.email || "N/A"}</td>
                  <td>{emp.department}</td>
                  <td>₹{emp.salary}</td>
                  <td>₹{emp.bonus}</td>
                  <td style={{ color: "#ef4444", fontWeight: "600" }}>- ₹{emp.totalDeduction || 0}</td>
                  <td style={{ fontWeight: "800", color: "#10b981" }}>₹{emp.salary + emp.bonus - (emp.totalDeduction || 0)}</td>

                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => openEditModal(emp)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(emp._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">

            <h3>{isEdit ? "Edit Employee" : "Add Employee"}</h3>

            {!isEdit && (
              <>
                <label>Name</label>
                <input name="name" value={form.name} onChange={handleChange} />

                <label>Email</label>
                <input name="email" value={form.email} onChange={handleChange} />

                <label>Profile Image</label>
                <input type="file" accept="image/*" onChange={handleImage} />

                {preview && (
                  <img
                    src={preview}
                    alt="preview"
                    style={{
                      width: "80px",
                      borderRadius: "50%",
                      marginTop: "10px"
                    }}
                  />
                )}
              </>
            )}

            <label>Department</label>
            <input name="department" value={form.department} onChange={handleChange} />

            <label>Salary</label>
            <input type="number" name="salary" value={form.salary} onChange={handleChange} />

            <label>Bonus</label>
            <input type="number" name="bonus" value={form.bonus} onChange={handleChange} />

            <label>Employee ID</label>
            <input name="employeeId" value={form.employeeId} onChange={handleChange} disabled={isEdit} />

            <label>Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} />

            <label>Address</label>
            <textarea name="address" value={form.address} onChange={handleChange} />

            <div className="modal-actions">

              <button
                className="btn secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button
                className="btn primary"
                onClick={isEdit ? handleUpdate : handleAddEmployee}
              >
                {isEdit ? "Save" : "Add"}
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ManageEmployees;