import Comment from "../models/Comment.js";
import Book from "../models/Book.js";

// ✅ Toggle like
export const toggleLike = async (req, res) => {
  const { bookId } = req.params;
  const userId = req.user._id;

  const book = await Book.findById(bookId);
  if (!book) return res.status(404).json({ message: "Book not found" });

  const alreadyLiked = book.likes.includes(userId);
  if (alreadyLiked) {
    book.likes.pull(userId);
  } else {
    book.likes.push(userId);
  }

  await book.save();
  res.json({ liked: !alreadyLiked, totalLikes: book.likes.length });
};

// ✅ Get likes
export const getLikes = async (req, res) => {
  const { bookId } = req.params;
  const book = await Book.findById(bookId).populate("likes", "username email");
  if (!book) return res.status(404).json({ message: "Book not found" });
  res.json(book.likes);
};

// ✅ Add comment
export const addComment = async (req, res) => {
  const { bookId } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: "No content provided" });
  }

  const comment = await Comment.create({
    book: bookId,
    user: req.user._id,
    text: content,
  });

  res.status(201).json({ comment });
};

// ✅ Get comments
export const getComments = async (req, res) => {
  const { bookId } = req.params;
  const comments = await Comment.find({ book: bookId }).populate(
    "user",
    "username"
  );
  res.json(comments);
};
