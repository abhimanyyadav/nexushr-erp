import { useState, useEffect } from "react";
import "./Salary.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Salary = () => {
  const [salaryData, setSalaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    const fetchSalaryAndLeaves = async () => {
      try {
        const resSalary = await fetch((window.API_BASE_URL || (window.API_BASE_URL || "http://localhost:8080")) + "/api/auth/me", { credentials: "include" });
        const dataSalary = await resSalary.json();
        if (resSalary.ok) setSalaryData(dataSalary);

        const resLeaves = await fetch((window.API_BASE_URL || (window.API_BASE_URL || "http://localhost:8080")) + "/api/leave/my-leaves", { credentials: "include" });
        const dataLeaves = await resLeaves.json();
        if (resLeaves.ok) setLeaves(dataLeaves);
      } catch (err) { console.log(err); }
      finally { setLoading(false); }
    };
    fetchSalaryAndLeaves();
  }, []);

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      const gross = salaryData.salary || 0;
      const net = gross + (salaryData.bonus || 0) - totalDeduction;

      // 🔹 HEADER
      doc.setFontSize(22);
      doc.setTextColor(40);
      doc.text("NEXUS ERP - PAYSLIP", 105, 20, { align: "center" });
      
      doc.setFontSize(12);
      doc.text(`Month: May 2026`, 105, 30, { align: "center" });
      doc.line(20, 35, 190, 35);

      // 🔹 EMPLOYEE INFO
      doc.setFontSize(10);
      doc.text(`Employee Name: ${salaryData.name}`, 20, 45);
      doc.text(`Employee ID: ${salaryData.employeeId || "N/A"}`, 20, 52);
      doc.text(`Email: ${salaryData.email}`, 20, 59);
      doc.text(`Department: ${salaryData.department || "Not Assigned"}`, 120, 45);
      doc.text(`Status: PAID`, 120, 52);

      // 🔹 SALARY TABLE
      autoTable(doc, {
        startY: 70,
        head: [['Description', 'Amount (INR)']],
        body: [
          ['Gross Basic Salary', `Rs. ${gross}`],
          ['Performance Bonus', `+ Rs. ${salaryData.bonus || 0}`],
          ['Leave Deductions', `- Rs. ${totalDeduction}`],
          ['NET PAYABLE', `Rs. ${net}`]
        ],
        theme: 'striped',
        headStyles: { fillColor: [124, 58, 237] } // Fixed headStyles property
      });

      // 🔹 FOOTER
      const finalY = doc.lastAutoTable?.finalY || 120;
      doc.setFontSize(10);
      doc.text("This is a computer generated document. No signature required.", 105, finalY + 20, { align: "center" });

      // 🔹 SAVE
      doc.save(`Payslip_${salaryData.name}_May2026.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Error generating PDF. Please check the console or try again.");
    }
  };

  if (loading) return <div className="loading">Loading payroll data...</div>;
  if (!salaryData) return <div className="error">No payroll records found.</div>;

  const baseSalary = salaryData.salary || 0;
  const bonus = salaryData.bonus || 0;

  // 🔹 Sum deductions (using saved deduction or falling back dynamically for pre-existing approved leaves)
  const totalDeduction = leaves
    .filter(leave => leave.status === "approved")
    .reduce((sum, leave) => {
      const deductionAmount = leave.deduction || Math.round((baseSalary / 30) * leave.numberOfDays);
      return sum + deductionAmount;
    }, 0);
  
  return (
    <div className="salary-container">
      <h2 className="page-title">Monthly Payroll & Salary</h2>
      
      <div className="salary-grid">
        <div className="card summary-card">
          <div className="salary-header">
            <h3>Current Month Overview</h3>
            <span className="status-tag">Paid</span>
          </div>
          
          <div className="amount-display">
            <span className="currency">₹</span>
            <span className="total-amount">{baseSalary + bonus - totalDeduction}</span>
          </div>
          
          <div className="breakdown">
            <div className="item">
              <span>Gross Salary</span>
              <span>₹{baseSalary}</span>
            </div>
            <div className="item">
              <span>Performance Bonus</span>
              <span className="positive">+ ₹{bonus}</span>
            </div>
            <div className="item">
              <span>Leave Deductions</span>
              <span className="negative">- ₹{totalDeduction}</span>
            </div>
            <div className="item total">
              <span>Net Payable (Net Salary)</span>
              <span>₹{baseSalary + bonus - totalDeduction}</span>
            </div>
          </div>
        </div>

        <div className="card info-card">
          <h3>Payroll Information</h3>
          <div className="info-list">
            <div className="info-item">
              <label>Bank Account</label>
              <p>XXXX XXXX 4589</p>
            </div>
            <div className="info-item">
              <label>Pay Period</label>
              <p>May 2026</p>
            </div>
            <div className="info-item">
              <label>Employee ID</label>
              <p>{salaryData.employeeId || "Not Assigned"}</p>
            </div>
          </div>
          
          <button className="btn primary download-btn" onClick={generatePDF}>
            Download Payslip (PDF)
          </button>
        </div>
      </div>

      <div className="card history-card">
        <h3>Payment History</h3>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Base Salary</th>
                <th>Bonus</th>
                <th>Deductions</th>
                <th>Net Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>April 2026</td>
                <td>₹{baseSalary}</td>
                <td>₹0</td>
                <td>₹0</td>
                <td>₹{baseSalary}</td>
                <td><span className="status-pill success">Settled</span></td>
              </tr>
              <tr>
                <td>March 2026</td>
                <td>₹{baseSalary}</td>
                <td>₹1000</td>
                <td>₹500</td>
                <td>₹{baseSalary + 500}</td>
                <td><span className="status-pill success">Settled</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Salary;
