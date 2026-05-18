const mongoose = require("mongoose");
const Holiday = require("./models/Holiday");

const seedHolidays = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/authDB");
    console.log("Connected to MongoDB for seeding...");

    // Clear existing
    await Holiday.deleteMany({});

    const holidays = [];
    const year = 2026;

    for (let month = 0; month < 12; month++) {
      let count = 0;
      const usedDays = new Set();

      while (count < 3) {
        const totalDays = new Date(year, month + 1, 0).getDate();
        const day = Math.floor(Math.random() * totalDays) + 1;
        const date = new Date(year, month, day);
        date.setHours(0, 0, 0, 0);

        // Avoid Sundays and duplicates
        if (date.getDay() !== 0 && !usedDays.has(day)) {
          holidays.push({
            title: `Random Unrestricted Holiday ${count + 1}`,
            date,
            type: "Unreserved",
            description: "Automatically generated unrestricted holiday"
          });
          usedDays.add(day);
          count++;
        }
      }
    }

    await Holiday.insertMany(holidays);
    console.log(`Successfully seeded ${holidays.length} unrestricted holidays!`);
    process.exit();
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

seedHolidays();
