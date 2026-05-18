const Announcement = require("../models/Announcement");
const User = require("../models/User");
const { sendNotification } = require("./notificationController");

// ================= CREATE ANNOUNCEMENT (ADMIN ONLY) =================
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content, category, priority } = req.body;
    const userId = req.session.user.id;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const announcement = await Announcement.create({
      title,
      content,
      category,
      priority,
      createdBy: userId
    });

    // 🔹 Trigger system notification to ALL users for medium/high priority
    if (priority === "High" || priority === "Medium") {
      try {
        const users = await User.find({ _id: { $ne: userId } });
        for (const u of users) {
          await sendNotification(
            u._id,
            userId,
            "system",
            `📢 Announcement: ${title}`,
            `A new notice has been pinned: "${content.substring(0, 60)}..."`
          );
        }
      } catch (notifErr) {
        console.error("FAIL TO NOTIFY USERS OF NOTICE:", notifErr);
      }
    }

    res.status(201).json({ message: "Announcement published successfully", announcement });
  } catch (err) {
    console.error("CREATE ANNOUNCEMENT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET ANNOUNCEMENTS (ALL ROLES) =================
exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate("createdBy", "name email role profilePic")
      .sort({ createdAt: -1 });
    
    res.status(200).json(announcements);
  } catch (err) {
    console.error("GET ANNOUNCEMENTS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= DELETE ANNOUNCEMENT (ADMIN ONLY) =================
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findByIdAndDelete(id);

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    res.status(200).json({ message: "Announcement deleted successfully" });
  } catch (err) {
    console.error("DELETE ANNOUNCEMENT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
