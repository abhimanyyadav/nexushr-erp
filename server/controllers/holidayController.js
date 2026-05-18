const Holiday = require("../models/Holiday");

// ================= ADD HOLIDAY =================
exports.addHoliday = async (req, res) => {
  try {
    const { title, date, description, type } = req.body;

    if (!title || !date) {
      return res.status(400).json({ message: "Title and Date are required" });
    }

    const holiday = await Holiday.create({
      title,
      date,
      description,
      type
    });

    res.status(201).json(holiday);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "A holiday already exists on this date" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET ALL HOLIDAYS =================
exports.getHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 });
    res.status(200).json(holidays);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ================= DELETE HOLIDAY =================
exports.deleteHoliday = async (req, res) => {
  try {
    await Holiday.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Holiday deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
// ================= TOGGLE HOLIDAY (QUICK EDIT) =================
exports.toggleHoliday = async (req, res) => {
  try {
    const { date, title } = req.body;

    const targetDate = new Date(date);
    targetDate.setHours(0,0,0,0);

    const existing = await Holiday.findOne({ date: targetDate });

    if (!existing) {
      const newHoliday = await Holiday.create({
        title: title || "Holiday",
        date: targetDate,
        type: "Reserved"
      });
      return res.status(201).json(newHoliday);
    } else if (existing.type === "Reserved") {
      existing.type = "Unreserved";
      await existing.save();
      return res.status(200).json(existing);
    } else {
      await Holiday.findByIdAndDelete(existing._id);
      return res.status(200).json({ message: "Holiday removed" });
    }
  } catch (err) {
    console.error("TOGGLE HOLIDAY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
