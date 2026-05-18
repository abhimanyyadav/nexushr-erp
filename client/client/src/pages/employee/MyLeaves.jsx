import { useEffect, useState } from "react";
import "./MyLeaves.css";

const MyLeaves = () => {

  // 🔹 Store leaves
  const [leaves, setLeaves] = useState([]);

  // ================= FETCH LEAVES =================

  useEffect(() => {

    fetch(
      "http://localhost:8080/api/leave/my-leaves",
      {
        credentials: "include"
      }
    )
      .then(res => res.json())
      .then(data => {

        console.log("Leaves:", data);

        // 🔹 Safety check
        if (Array.isArray(data)) {

          setLeaves(data);

        } else {

          console.log("Not array:", data);

          setLeaves([]);

        }

      })
      .catch(err => {

        console.log("Error fetching leaves:", err);

        setLeaves([]);

      });

  }, []);




  // ================= STATS =================

  const totalRequests =
    leaves.length;

  const approvedDays =
    leaves.filter(
      leave =>
        leave.status === "approved"
    ).length;

  const pendingRequests =
    leaves.filter(
      leave =>
        leave.status === "pending"
    ).length;




  return (

    <div className="myLeaves-container">

      <h2 className="page-title">
        My Leaves
      </h2>



      {/* ================= STATS ================= */}

      <div className="stats">

        <div className="card">
          Total Requests: {totalRequests}
        </div>

        <div className="card">
          Approved: {approvedDays}
        </div>

        <div className="card">
          Pending: {pendingRequests}
        </div>

      </div>



      {/* ================= TABLE ================= */}

      <div className="card">

        <h3>Leave History</h3>

        <div className="table-responsive">
          <table>

            <thead>

              <tr>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Status</th>
              </tr>

            </thead>

            <tbody>

              {leaves.length === 0 ? (

                <tr>
                  <td colSpan="4">
                    No leave records found
                  </td>
                </tr>

              ) : (

                leaves.map((leave) => (

                  <tr key={leave._id}>

                    <td>
                      {leave.leaveType}
                    </td>

                    <td>
                      {new Date(
                        leave.fromDate
                      ).toLocaleDateString()}
                    </td>

                    <td>
                      {new Date(
                        leave.toDate
                      ).toLocaleDateString()}
                    </td>

                    <td>

                      <span
                        className={`status ${leave.status}`}
                      >
                        {leave.status}
                      </span>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>
        </div>

      </div>

    </div>

  );

};

export default MyLeaves;