import { useState, useEffect } from "react";
import "../employee/Holidays.css";

const ManageHolidays = () => {
  const [holidays, setHolidays] = useState([]);
  const [form, setForm] = useState({ title: "", date: "", description: "", type: "Public" });
  const [loading, setLoading] = useState(true);

  const fetchHolidays = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/holiday", {
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok) setHolidays(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8080/api/holiday", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include"
      });
      if (res.ok) {
        alert("Holiday added ✅");
        setForm({ title: "", date: "", description: "", type: "Public" });
        fetchHolidays();
      } else {
        const data = await res.json();
        alert(data.message);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this holiday?")) return;
    try {
      const res = await fetch(`http://localhost:8080/api/holiday/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (res.ok) fetchHolidays();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="holidays-container">
      <h2>Manage Holiday Calendar</h2>

      <div className="card" style={{ marginBottom: "30px", padding: "20px" }}>
        <h3>Add New Holiday</h3>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "10px" }}>
          <input 
            placeholder="Holiday Title" 
            value={form.title} 
            onChange={(e) => setForm({...form, title: e.target.value})} 
            required 
          />
          <input 
            type="date" 
            value={form.date} 
            onChange={(e) => setForm({...form, date: e.target.value})} 
            required 
          />
          <select 
            value={form.type} 
            onChange={(e) => setForm({...form, type: e.target.value})}
          >
            <option>Reserved</option>
            <option>Unreserved</option>
          </select>
          <textarea 
            placeholder="Description" 
            value={form.description} 
            onChange={(e) => setForm({...form, description: e.target.value})}
          />
          <button type="submit" className="btn primary">Add Holiday</button>
        </form>
      </div>

      <h3>Current Holidays</h3>
      <div className="holidays-grid">
        {holidays.map((h) => (
          <div key={h._id} className="card holiday-card">
            <div className="holiday-date">
              <span className="day">{new Date(h.date).getDate()}</span>
              <span className="month">{new Date(h.date).toLocaleString('default', { month: 'short' })}</span>
            </div>
            <div className="holiday-info" style={{ flex: 1 }}>
              <h3>{h.title}</h3>
              <p className="holiday-type">{h.type}</p>
            </div>
            <button className="delete-btn" onClick={() => handleDelete(h._id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageHolidays;
