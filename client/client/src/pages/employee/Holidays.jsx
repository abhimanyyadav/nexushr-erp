import { useState, useEffect } from "react";
import "./Holidays.css";

const Holidays = () => {
  const [holidays, setHolidays] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const targetYear = 2026;

  const fetchHolidays = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/holiday", { credentials: "include" });
      const data = await res.json();
      if (res.ok) setHolidays(data);
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  const fetchUser = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/auth/me", { credentials: "include" });
      const data = await res.json();
      if (res.ok) setUser(data);
    } catch (err) { console.log(err); }
  };

  useEffect(() => {
    fetchHolidays();
    fetchUser();
  }, []);

  const handleDayClick = async (month, day) => {
    if (!day || user?.role !== "admin") return;
    const clickedDate = new Date(targetYear, month, day);
    try {
      const res = await fetch("http://localhost:8080/api/holiday/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: clickedDate, title: "Holiday" }),
        credentials: "include"
      });
      if (res.ok) fetchHolidays();
    } catch (err) { console.log(err); }
  };

  const getHolidayOnDay = (month, day) => {
    if (!day) return null;
    return holidays.find(h => {
      const d = new Date(h.date);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === targetYear;
    });
  };

  const renderMonth = (monthIndex) => {
    const monthName = new Date(targetYear, monthIndex).toLocaleString('default', { month: 'long' }).toUpperCase();
    const totalDays = new Date(targetYear, monthIndex + 1, 0).getDate();
    const startDay = new Date(targetYear, monthIndex, 1).getDay();
    
    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) days.push(i);

    return (
      <div key={monthIndex} className="month-box">
        <h4 className="month-title">{monthName}</h4>
        <div className="mini-grid">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} className={`mini-weekday ${i === 0 ? 'sun' : ''}`}>{d}</div>
          ))}
          {days.map((day, i) => {
            const isSunday = i % 7 === 0 && day !== null;
            const holiday = getHolidayOnDay(monthIndex, day);
            const holidayClass = holiday 
              ? (holiday.type === "Reserved" ? "res-h" : "unres-h")
              : "";
            
            return (
              <div 
                key={i} 
                className={`mini-day ${!day ? 'empty' : ''} ${isSunday ? 'sun-text' : ''} ${holidayClass} ${user?.role === 'admin' ? 'adm-ptr' : ''}`}
                onClick={() => handleDayClick(monthIndex, day)}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="year-calendar-container">
      <div className="calendar-header-main">
        <h1>NEXUS ERP - CALENDAR {targetYear}</h1>
      </div>

      <div className="year-grid">
        {[...Array(12).keys()].map(m => renderMonth(m))}
      </div>

      <div className="calendar-footer">
        <div className="footer-item"><span className="dot red"></span> Reserved Holiday (Salary Deduction for Extra Offs)</div>
        <div className="footer-item"><span className="dot blue"></span> Unreserved Holiday (No Salary Deduction)</div>
        <div className="footer-item"><span className="text red">1, 8, 15...</span> Sundays (Holidays)</div>
      </div>
    </div>
  );
};

export default Holidays;
