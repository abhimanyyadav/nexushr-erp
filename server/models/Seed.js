const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("./User");
const Employee = require("./Employee");
const Leave = require("./Leave");
// 🔹 MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/authDB");

const seedData = async () => {

  try {

    console.log("Seeding Started...");

    // 🔴 Clear Old Data
    await Leave.deleteMany();
    await Employee.deleteMany();
    await User.deleteMany();

    // 🔹 Hash Password
    const hashedPassword = await bcrypt.hash("123456", 10);

    // =================================================
    // 🟣 CREATE ADMIN USER
    // =================================================

    const adminUser = await User.create({
      name: "Main Admin",
      email: "admin@test.com",
      password: hashedPassword,
      role: "admin"
    });

    // =================================================
    // 🟣 CREATE 50 EMPLOYEES
    // =================================================

    const departments = ["IT", "HR", "Finance", "Marketing"];

    const leaveTypes = [
      "Sick Leave",
      "Annual Leave",
      "Casual Leave"
    ];

    const statuses = [
      "pending",
      "approved",
      "rejected"
    ];

    for (let i = 1; i <= 50; i++) {

      // Create User

      const user = await User.create({

        name: `Employee ${i}`,

        email: `employee${i}@test.com`,

        password: hashedPassword,

        role: "employee"

      });

      // Create Employee

      const employee = await Employee.create({

        name: `Employee ${i}`,

        department:
          departments[
            Math.floor(
              Math.random() * departments.length
            )
          ],

        salary:
          30000 +
          Math.floor(Math.random() * 40000),

        bonus:
          2000 +
          Math.floor(Math.random() * 5000),

        userId: user._id

      });

      // =================================================
      // 🟣 CREATE MULTIPLE LEAVES PER EMPLOYEE
      // =================================================

      const leaves = [];

      for (let j = 0; j < 5; j++) {

        const fromDate = new Date();

        fromDate.setDate(
          fromDate.getDate() -
          Math.floor(Math.random() * 30)
        );

        const toDate = new Date(fromDate);

        toDate.setDate(
          fromDate.getDate() +
          Math.floor(Math.random() * 5)
        );

        leaves.push({

          employeeId: employee._id,

          leaveType:
            leaveTypes[
              Math.floor(
                Math.random() *
                leaveTypes.length
              )
            ],

          fromDate,

          toDate,

          status:
            statuses[
              Math.floor(
                Math.random() *
                statuses.length
              )
            ]

        });

      }

      await Leave.insertMany(leaves);

    }

    console.log("Seeding Completed ✅");

    process.exit();

  } catch (error) {

    console.log("Seeding Error:", error);

    process.exit(1);

  }

};

seedData();