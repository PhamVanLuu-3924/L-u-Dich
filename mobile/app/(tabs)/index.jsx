import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DrawerContent from "../../constants/DrawerContent";
import { useAuthStore } from "../../store/authStore";
import { Image } from "expo-image";
import { API_URL } from "../../constants/api";
import COLORS from "../../constants/colors";
import styles from "../../assets/styles/home.styles";
import Loader from "../../components/Loader";
import { formatPublishDate } from "../../lib/utils";

export const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

const BookCard = ({
  item,
  currentUserId,
  onLike,
  onComment,
  likes,
  comments,
  friends,
}) => {
  const [commentText, setCommentText] = useState("");
  const isFriend = friends.some((f) => f._id === item.user._id);
  const isOwn = currentUserId === item.user._id;

  return (
    <View style={styles.bookCard}>
      <View style={styles.bookHeader}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: item.user?.profileImage }}
            style={styles.avatar}
          />
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.username}>
              {item.user?.username || "Unknown"}
            </Text>
            <Text style={{ marginLeft: 6, color: COLORS.textSecondary }}>
              {isOwn ? " (bạn)" : isFriend ? " (bạn bè)" : " (người lạ)"}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.bookImageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.bookImage}
          contentFit="cover"
        />
      </View>
      <View style={styles.bookDetails}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <View style={styles.ratingContainer}>
          {Array.from({ length: 5 }, (_, i) => (
            <Ionicons
              key={i}
              name={i + 1 <= item.rating ? "star" : "star-outline"}
              size={16}
              color={i + 1 <= item.rating ? "#f4b400" : COLORS.textSecondary}
              style={{ marginRight: 2 }}
            />
          ))}
        </View>
        <Text style={styles.caption}>{item.caption}</Text>
        <Text style={styles.date}>
          Share on {formatPublishDate(item.createdAt)}
        </Text>

        <TouchableOpacity
          onPress={() => onLike(item._id)}
          style={{ marginTop: 8, flexDirection: "row", alignItems: "center" }}
        >
          <Ionicons
            name={likes[item._id]?.liked ? "heart" : "heart-outline"}
            size={20}
            color={likes[item._id]?.liked ? "red" : COLORS.textSecondary}
          />
          <Text style={{ marginLeft: 5 }}>
            {likes[item._id]?.total || 0} lượt thích
          </Text>
        </TouchableOpacity>

        {/* 💬 Comment input */}
        <View style={{ marginTop: 8 }}>
          <Text>{comments[item._id]?.length || 0} bình luận</Text>
          <TextInput
            placeholder="Viết bình luận..."
            value={commentText}
            onChangeText={setCommentText}
            onSubmitEditing={() => {
              onComment(item._id, commentText);
              setCommentText("");
            }}
            style={{
              borderBottomWidth: 1,
              borderBottomColor: COLORS.border,
              paddingVertical: 4,
              marginTop: 4,
            }}
          />
        </View>

        {/* 💬 Danh sách bình luận */}
        <View style={{ marginTop: 8 }}>
          <Text style={{ fontWeight: "bold" }}>Bình luận:</Text>
          {comments[item._id]?.map((cmt, idx) => (
            <Text
              key={idx}
              style={{ color: COLORS.textSecondary, marginTop: 2 }}
            >
              <Text style={{ fontWeight: "600" }}>{cmt.user?.username}:</Text>{" "}
              {cmt.text}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
};

function HomeScreen() {
  const { token, user } = useAuthStore();
  const [books, setBooks] = useState([]);
  const [likes, setLikes] = useState({});
  const [comments, setComments] = useState({});
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchBooks = async (pageNum = 1, refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else if (pageNum === 1) setLoading(true);

      const res = await fetch(`${API_URL}/books?page=${pageNum}&limit=5`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);
      const unique =
        pageNum === 1 || refresh ? data.books : [...books, ...data.books];
      setBooks(unique);
      setPage(pageNum);
      setHasMore(pageNum < data.totalPages);

      // Fetch likes and comments
      for (const book of data.books) {
        fetchLike(book._id);
        fetchComment(book._id);
      }
    } catch (err) {
      console.log("Book fetch error:", err);
    } finally {
      if (refresh) await sleep(800);
      setRefreshing(false);
      setLoading(false);
    }
  };

  const fetchLike = async (bookId) => {
    try {
      const res = await fetch(`${API_URL}/books/${bookId}/likes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLikes((prev) => ({
        ...prev,
        [bookId]: {
          liked: data.some((u) => u._id === user._id),
          total: data.length,
        },
      }));
    } catch {}
  };

  const fetchComment = async (bookId) => {
    try {
      const res = await fetch(`${API_URL}/books/${bookId}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setComments((prev) => ({ ...prev, [bookId]: data }));
    } catch {}
  };

  const fetchFriends = async () => {
    try {
      const res = await fetch(`${API_URL}/users/friends`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFriends(data);
    } catch {}
  };

  useEffect(() => {
    fetchBooks();
    fetchFriends();
  }, []);

  const handleLike = async (bookId) => {
    try {
      await fetch(`${API_URL}/books/${bookId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchLike(bookId);
    } catch (e) {
      console.error("Like error", e);
    }
  };

  const handleComment = async (bookId, content) => {
    try {
      await fetch(`${API_URL}/books/${bookId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        //
        body: JSON.stringify({ text: content }),
      });
      fetchComment(bookId);
    } catch (e) {
      console.error("Comment error", e);
    }
  };

  if (loading) return <Loader />;

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        renderItem={({ item }) => (
          <BookCard
            item={item}
            currentUserId={user._id}
            onLike={handleLike}
            onComment={handleComment}
            likes={likes}
            comments={comments}
            friends={friends}
          />
        )}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchBooks(1, true)}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        onEndReached={() => {
          if (hasMore) fetchBooks(page + 1);
        }}
        onEndReachedThreshold={0.1}
      />
    </View>
  );
}

function StackNav() {
  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        headerStyle: { backgroundColor: COLORS.background },
        headerTitleAlign: "center",
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Ionicons
              name="menu"
              size={26}
              color={COLORS.textPrimary}
              style={{ marginLeft: 12 }}
            />
          </TouchableOpacity>
        ),
      })}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Trang chủ BookWorm 🐉" }}
      />
    </Stack.Navigator>
  );
}

export default function Home() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen name="HomeDrawer" component={StackNav} />
    </Drawer.Navigator>
  );
}
