// assets/styles/friends.js
import { StyleSheet } from "react-native";
import COLORS from "../../constants/colors";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  friendCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: COLORS.border,
  },
  nameEmail: {
    flexShrink: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  email: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.textSecondary,
    borderRadius: 8,
  },
  deleteText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  bookItem: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bookImage: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    marginBottom: 8,
  },
  bookInfo: {
    marginBottom: 4,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  ratingContainer: {
    flexDirection: "row",
    marginTop: 2,
  },
  bookCaption: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginVertical: 4,
  },
  bookDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
