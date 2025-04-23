import express from "express";
import protectRoute from "../middleware/auth.middleware.js";
import User from "../models/User.js";

const router = express.Router();

// ✅ Lấy tất cả user trừ chính mình
router.get("/all", protectRoute, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select(
      "_id username email profileImage"
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Kết bạn (add friend ngay lập tức)
router.post("/friends/:friendId", protectRoute, async (req, res) => {
  try {
    const friendId = req.params.friendId;
    const user = await User.findById(req.user._id);

    if (!user.friends.includes(friendId)) {
      user.friends.push(friendId);
      await user.save();
    }

    res.json({ message: "Friend added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Xóa bạn
router.delete("/friends/:friendId", protectRoute, async (req, res) => {
  try {
    const friendId = req.params.friendId;
    const user = await User.findById(req.user._id);

    user.friends = user.friends.filter(
      (id) => id.toString() !== friendId.toString()
    );
    await user.save();

    res.json({ message: "Friend removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Lấy danh sách bạn bè
router.get("/friends", protectRoute, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "friends",
      "username email profileImage"
    );
    res.json(user.friends);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
