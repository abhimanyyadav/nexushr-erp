import { useState, useEffect } from "react";
import "./ApplyLeave.css";

const ApplyLeave = () => {

  // Today's date
  const today =
    new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    type: "Annual Leave",
    from: "",
    to: "",
    reason: "",
  });

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [message, setMessage] =
    useState("");

  const [isError, setIsError] =
    useState(false);

  // ✅ NEW: Leave balance state
  const [balance, setBalance] =
    useState(null);

  const [holidays, setHolidays] = useState([]);
  const [myLeaves, setMyLeaves] = useState([]);
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());

  // ================= FETCH BALANCE =================

  useEffect(() => {
    const fetchBalanceAndHolidays = async () => {
      try {
        const resB = await fetch((window.API_BASE_URL || (window.API_BASE_URL || "http://localhost:8080")) + "/api/leave/balance", { credentials: "include" });
        const dataB = await resB.json();
        if (resB.ok) setBalance(dataB);

        const resH = await fetch((window.API_BASE_URL || (window.API_BASE_URL || "http://localhost:8080")) + "/api/holiday", { credentials: "include" });
        const dataH = await resH.json();
        if (resH.ok) setHolidays(dataH);

        const resL = await fetch((window.API_BASE_URL || (window.API_BASE_URL || "http://localhost:8080")) + "/api/leave/my-leaves", { credentials: "include" });
        const dataL = await resL.json();
        if (resL.ok) setMyLeaves(dataL);

      } catch (err) {
        console.log(err);
      }
    };
    fetchBalanceAndHolidays();
  }, []);



  // ================= HANDLE INPUT =================

  const handleChange = (e) => {
    let { name, value } = e.target;

    // Restrict year selection to 4 digits maximum to avoid inputs like 2000033
    if (name === "from" || name === "to") {
      if (value) {
        const parts = value.split("-");
        const year = parts[0];
        if (year && year.length > 4) {
          parts[0] = year.substring(0, 4);
          value = parts.join("-");
        }
      }
    }

    setForm({
      ...form,
      [name]: value
    });

  };



  // ================= HANDLE FILE =================

  const handleFileChange = (e) => {

    setSelectedFile(
      e.target.files[0]
    );

  };



  // ================= SUBMIT =================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setMessage("");

    if (form.from < today) {

      setMessage(
        "Past dates are not allowed"
      );

      setIsError(true);
      return;

    }

    // Restrict year limit to a reasonable future date (max year 2035)
    const fromYear = new Date(form.from).getFullYear();
    const toYear = new Date(form.to).getFullYear();
    if (fromYear > 2035 || toYear > 2035) {
      setMessage("Please select a valid year. Dates cannot exceed year 2035.");
      setIsError(true);
      return;
    }

    if (form.from > form.to) {

      setMessage(
        "From date cannot be after To date"
      );

      setIsError(true);
      return;

    }

    try {

      const formData =
        new FormData();

      formData.append(
        "leaveType",
        form.type
      );

      formData.append(
        "fromDate",
        form.from
      );

      formData.append(
        "toDate",
        form.to
      );

      formData.append(
        "reason",
        form.reason
      );

      if (selectedFile) {

        formData.append(
          "document",
          selectedFile
        );

      }

      const res = await fetch(
        (window.API_BASE_URL || (window.API_BASE_URL || "http://localhost:8080")) + "/api/leave/apply",
        {
          method: "POST",
          credentials: "include",
          body: formData
        }
      );

      const data =
        await res.json();

      if (res.ok) {

        setMessage(
          "Leave applied successfully ✅"
        );

        setIsError(false);

        setForm({
          type: "Annual Leave",
          from: "",
          to: "",
          reason: ""
        });

        setSelectedFile(null);

        // ✅ Refresh balance
        window.location.reload();

      } else {

        setMessage(
          data.message ||
          "Failed to apply leave"
        );

        setIsError(true);

      }

    } catch (err) {

      console.log(err);

      setMessage("Server error");

      setIsError(true);

    }

  };

  // ================= CALENDAR UTILS =================

  const prevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(calYear - 1);
    } else {
      setCalMonth(calMonth - 1);
    }
  };

  const nextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(calYear + 1);
    } else {
      setCalMonth(calMonth + 1);
    }
  };

  const getDayStatus = (y, m, d) => {
    if (!d) return null;
    const dateObj = new Date(y, m, d);
    dateObj.setHours(0, 0, 0, 0);

    // 1. Check if selected range in form
    if (form.from && form.to) {
      const fromObj = new Date(form.from);
      fromObj.setHours(0, 0, 0, 0);
      const toObj = new Date(form.to);
      toObj.setHours(0, 0, 0, 0);
      if (dateObj >= fromObj && dateObj <= toObj) {
        return { type: "draft-range", label: "Selected Range" };
      }
    } else if (form.from) {
      const fromObj = new Date(form.from);
      fromObj.setHours(0, 0, 0, 0);
      if (dateObj.getTime() === fromObj.getTime()) {
        return { type: "draft-start", label: "Start Date" };
      }
    }

    // 2. Check if Holiday
    const holiday = holidays.find(h => {
      const hd = new Date(h.date);
      return hd.getDate() === d && hd.getMonth() === m && hd.getFullYear() === y;
    });
    if (holiday) {
      return { 
        type: holiday.type === "Reserved" ? "holiday-res" : "holiday-unres", 
        label: `${holiday.title} (${holiday.type})` 
      };
    }

    // 3. Check if Sunday
    if (dateObj.getDay() === 0) {
      return { type: "sunday", label: "Sunday" };
    }

    // 4. Check if applied leave
    const activeLeave = myLeaves.find(leave => {
      const fromL = new Date(leave.fromDate);
      fromL.setHours(0, 0, 0, 0);
      const toL = new Date(leave.toDate);
      toL.setHours(0, 0, 0, 0);
      return dateObj >= fromL && dateObj <= toL && leave.status !== "rejected";
    });

    if (activeLeave) {
      return { 
        type: `leave-${activeLeave.status}`, 
        label: `${activeLeave.leaveType} (${activeLeave.status})` 
      };
    }

    return null;
  };

  const handleCalendarDayClick = (y, m, d) => {
    if (!d) return;
    const clickedDate = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    
    if (clickedDate < today) {
      alert("Past dates are not allowed for leave requests.");
      return;
    }

    if (!form.from || (form.from && form.to)) {
      setForm({
        ...form,
        from: clickedDate,
        to: ""
      });
    } else {
      if (clickedDate < form.from) {
        setForm({
          ...form,
          from: clickedDate,
          to: ""
        });
      } else {
        setForm({
          ...form,
          to: clickedDate
        });
      }
    }
  };

  const renderMiniCalendar = () => {
    const monthName = new Date(calYear, calMonth).toLocaleString('default', { month: 'long' });
    const totalDays = new Date(calYear, calMonth + 1, 0).getDate();
    const startDay = new Date(calYear, calMonth, 1).getDay();
    
    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) days.push(i);

    return (
      <div className="mini-calendar-card">
        <div className="mini-calendar-header">
          <button type="button" className="cal-nav-btn" onClick={prevMonth}>&larr;</button>
          <span className="cal-month-title">{monthName} {calYear}</span>
          <button type="button" className="cal-nav-btn" onClick={nextMonth}>&rarr;</button>
        </div>
        <div className="mini-calendar-grid">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d, i) => (
            <div key={i} className={`mini-cal-weekday ${i === 0 ? 'sun' : ''}`}>{d}</div>
          ))}
          {days.map((day, i) => {
            const status = getDayStatus(calYear, calMonth, day);
            let dayClass = "";
            let titleAttr = "";
            
            if (day) {
              dayClass = "active-day";
              if (status) {
                dayClass += ` ${status.type}`;
                titleAttr = status.label;
              }
            } else {
              dayClass = "empty-day";
            }

            return (
              <div 
                key={i} 
                className={`mini-cal-day ${dayClass}`}
                title={titleAttr}
                onClick={() => handleCalendarDayClick(calYear, calMonth, day)}
              >
                {day}
              </div>
            );
          })}
        </div>
        <div className="mini-calendar-legend">
          <div className="legend-item"><span className="dot holiday-res"></span> Reserved Hol.</div>
          <div className="legend-item"><span className="dot holiday-unres"></span> Unreserved Hol.</div>
          <div className="legend-item"><span className="dot leave-approved"></span> Approved Leave</div>
          <div className="legend-item"><span className="dot leave-pending"></span> Pending Leave</div>
          <div className="legend-item"><span className="dot draft-range"></span> Selected Range</div>
        </div>
      </div>
    );
  };

  return (

    <div className="apply-container">

      <h2 className="page-title">
        Request New Leave
      </h2>

      <div className="apply-grid">

        {/* LEFT FORM */}

        <div className="card">

          <h3>
            Application Details
          </h3>

          <form onSubmit={handleSubmit}>

            <label>
              Leave Type
            </label>

            <select
              name="type"
              value={form.type}
              onChange={handleChange}
            >

              <option>Annual Leave</option>
              <option>Sick Leave</option>
              <option>Casual Leave</option>
              <option>Unpaid Leave</option>

            </select>



            <div className="row">

              <div>

                <label>
                  From Date
                </label>

                <input
                  type="date"
                  name="from"
                  value={form.from}
                  min={today}
                  max="2035-12-31"
                  onChange={handleChange}
                  required
                />

              </div>



              <div>

                <label>
                  To Date
                </label>

                <input
                  type="date"
                  name="to"
                  value={form.to}
                  min={
                    form.from || today
                  }
                  max="2035-12-31"
                  onChange={handleChange}
                  required
                />

              </div>

            </div>



            <label>
              Reason
            </label>

            <textarea
              name="reason"
              placeholder="Explain your leave..."
              value={form.reason}
              onChange={handleChange}
              required
            />



            <label>
              Upload Proof
            </label>

            <input
              type="file"
              accept="image/*,.pdf"
              onChange={
                handleFileChange
              }
            />



            <div className="actions">

              <button
                type="submit"
                className="btn primary"
              >
                Apply Leave
              </button>

            </div>

          </form>



          {message && (

            <p
              style={{
                marginTop: "10px",
                color: isError
                  ? "red"
                  : "green"
              }}
            >
              {message}
            </p>

          )}

        </div>



        {/* RIGHT SIDEBAR */}

        <div className="sidebar">

          <div className="card">

            <h4>
              Leave Balances
            </h4>

            {balance ? (
              <div className="balance-grid">
                <div className="balance-item">
                  <span>Sick Leave:</span>
                  <strong>{balance.sickLeave.total - balance.sickLeave.used} / {balance.sickLeave.total}</strong>
                </div>
                <div className="balance-item">
                  <span>Casual Leave:</span>
                  <strong>{balance.casualLeave.total - balance.casualLeave.used} / {balance.casualLeave.total}</strong>
                </div>
                <div className="balance-item">
                  <span>Annual Leave:</span>
                  <strong>{balance.annualLeave.total - balance.annualLeave.used} / {balance.annualLeave.total}</strong>
                </div>
              </div>
            ) : (
              <p>Loading balance...</p>
            )}

          </div>

          <div className="card" style={{ marginTop: "20px" }}>
            <h4>Leave & Holiday Calendar</h4>
            <div style={{ marginTop: "15px" }}>
              {renderMiniCalendar()}
            </div>
          </div>

        </div>

      </div>

    </div>

  );

};

export default ApplyLeave;