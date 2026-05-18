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



  // ================= FETCH BALANCE =================

  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    const fetchBalanceAndHolidays = async () => {
      try {
        const resB = await fetch("http://localhost:8080/api/leave/balance", { credentials: "include" });
        const dataB = await resB.json();
        if (resB.ok) setBalance(dataB);

        const resH = await fetch("http://localhost:8080/api/holiday", { credentials: "include" });
        const dataH = await resH.json();
        if (resH.ok) setHolidays(dataH);

      } catch (err) {
        console.log(err);
      }
    };
    fetchBalanceAndHolidays();
  }, []);



  // ================= HANDLE INPUT =================

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
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
        "http://localhost:8080/api/leave/apply",
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
            <h4>2026 Holidays</h4>
            <div className="holiday-preview-list">
              {holidays.slice(0, 12).map(h => (
                <div key={h._id} className={`h-item-preview ${h.type === 'Reserved' ? 'res' : 'unres'}`}>
                  <span className="h-date-prev">{new Date(h.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                  <span className="h-title-prev">{h.title}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>

  );

};

export default ApplyLeave;