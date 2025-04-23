import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Book.js";
import protectRoute from "../middleware/auth.middleware.js";
import {
  toggleLike,
  getLikes,
  addComment,
  getComments,
} from "../controllers/bookController.js";

const router = express.Router();

// Create new book
router.post("/", protectRoute, async (req, res) => {
  try {
    const { title, caption, rating, image } = req.body;
    if (!image || !title || !caption || !rating) {
      return res.status(400).json({ message: "Please provide all fields" });
    }

    if (!image.startsWith("data:image/")) {
      return res.status(400).json({ message: "Invalid image format" });
    }

    const uploadResponse = await cloudinary.uploader.upload(image, {
      resource_type: "image",
    });
    const imageUrl = uploadResponse.secure_url;

    const newBook = new Book({
      title,
      caption,
      rating,
      image: imageUrl,
      user: req.user._id,
    });

    await newBook.save();
    res.status(201).json(newBook);
  } catch (error) {
    console.log("Error creating book", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// GET /books/by-user/:userId
router.get("/by-user/:userId", protectRoute, async (req, res) => {
  try {
    const books = await Book.find({ user: req.params.userId }).sort({
      createdAt: -1,
    });
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /books/by-user-count
router.get("/by-user-count", protectRoute, async (req, res) => {
  const counts = await Book.aggregate([
    { $group: { _id: "$user", count: { $sum: 1 } } },
    {
      $project: {
        userId: "$_id",
        count: 1,
        _id: 0,
      },
    },
  ]);
  res.json(counts);
});

// Get books with pagination
router.get("/", protectRoute, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const books = await Book.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username profileImage");

    const totalBooks = await Book.countDocuments();
    res.send({
      books,
      currentPage: page,
      totalBooks,
      totalPages: Math.ceil(totalBooks / limit),
    });
  } catch (error) {
    console.log("Error in get all books route", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get books by user
router.get("/user", protectRoute, async (req, res) => {
  try {
    const books = await Book.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(books);
  } catch (error) {
    console.log("Error user books error", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete book
router.delete("/:id", protectRoute, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    if (book.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (book.image && book.image.includes("cloudinary")) {
      try {
        const publicId = book.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (deleteError) {
        console.log("Error deleting image from cloudinary", deleteError);
      }
    }

    await book.deleteOne();
    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    console.log("Error deleting book", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Like / Unlike
router.post("/:bookId/like", protectRoute, toggleLike);
router.get("/:bookId/likes", protectRoute, getLikes);

// Comment
router.post("/:bookId/comments", protectRoute, addComment);
router.get("/:bookId/comments", protectRoute, getComments);

export default router;
