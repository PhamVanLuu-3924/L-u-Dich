import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const routes = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15d" });
};

const isValidEmailDomain = (email) => {
  return email.endsWith("@gmail.com") || email.endsWith("@hotmail.com");
};

routes.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    if (!isValidEmailDomain(email)) {
      return res
        .status(400)
        .json({ message: "Email phải là @gmail.com hoặc @hotmail.com" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Mật khẩu phải có ít nhất 6 ký tự" });
    }

    if (username.length < 3) {
      return res
        .status(400)
        .json({ message: "Tên người dùng phải có ít nhất 3 ký tự" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email đã được sử dụng" });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Tên người dùng đã tồn tại" });
    }

    const profileImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

    const user = new User({
      email,
      username,
      password,
      profileImage,
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.log("Lỗi khi đăng ký:", error);
    res.status(500).json({ message: "Có lỗi xảy ra, vui lòng thử lại sau" });
  }
});

routes.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    if (!isValidEmailDomain(email)) {
      return res
        .status(400)
        .json({ message: "Email phải là @gmail.com hoặc @hotmail.com" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Người dùng không tồn tại" });
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Sai thông tin đăng nhập" });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.log("Lỗi khi đăng nhập:", error);
    res.status(500).json({ message: "Có lỗi xảy ra, vui lòng thử lại sau" });
  }
});

export default routes;
