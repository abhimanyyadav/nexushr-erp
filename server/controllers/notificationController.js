const Notification = require("../models/Notification");

// ================= GET NOTIFICATIONS =================
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.status(200).json(notifications);
  } catch (err) {
    console.error("GET NOTIFICATIONS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

// ================= MARK AS READ =================
exports.markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.session.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json(notification);
  } catch (err) {
    console.error("MARK READ ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= MARK ALL AS READ =================
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.session.user.id;
    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("MARK ALL READ ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= HELPER DISPATCHER =================
exports.sendNotification = async (recipientId, senderId, type, title, message) => {
  try {
    const newNotif = new Notification({
      recipient: recipientId,
      sender: senderId,
      type,
      title,
      message
    });
    await newNotif.save();
    return newNotif;
  } catch (err) {
    console.error("DISPATCH NOTIFICATION ERROR:", err);
  }
};
