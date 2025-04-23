import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Image } from "expo-image";
import { API_URL } from "../../constants/api";
import { useAuthStore } from "../../store/authStore";
import styles from "../../assets/styles/friends";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import COLORS from "../../constants/colors";

export default function FriendsScreen() {
  const { token, user } = useAuthStore();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [friendPosts, setFriendPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const isFocused = useIsFocused();

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/users/friends`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFriends(data);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch friends");
    } finally {
      setLoading(false);
    }
  };

  const removeFriend = async (friendId) => {
    try {
      setRemovingId(friendId);
      const res = await fetch(`${API_URL}/users/friends/${friendId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setFriends((prev) => prev.filter((f) => f._id !== friendId));
      Alert.alert("✅", "Friend removed!");
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to remove friend");
    } finally {
      setRemovingId(null);
    }
  };

  const fetchFriendPosts = async (friend) => {
    try {
      setPostsLoading(true);
      const res = await fetch(`${API_URL}/books/by-user/${friend._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFriendPosts(data);
    } catch (err) {
      console.log("Fetch friend posts failed", err);
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      setSelectedFriend(null);
      fetchFriends();
    }
  }, [isFocused]);

  const filteredFriends = friends.filter(
    (f) =>
      f.username.toLowerCase().includes(searchText.toLowerCase()) ||
      f.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderFriendItem = ({ item }) => (
    <View style={styles.friendCard}>
      <View style={styles.infoBox}>
        <Image source={{ uri: item.profileImage }} style={styles.avatar} />
        <View style={styles.nameEmail}>
          <TouchableOpacity
            onPress={() => {
              setSelectedFriend(item);
              fetchFriendPosts(item);
            }}
          >
            <Text style={styles.username}>{item.username}</Text>
          </TouchableOpacity>
          <Text style={styles.email}>{item.email}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => removeFriend(item._id)}
        disabled={removingId === item._id}
      >
        <Text style={styles.deleteText}>
          {removingId === item._id ? "..." : "Xoá"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderPostItem = ({ item }) => (
    <View style={styles.bookItem}>
      <Image source={{ uri: item.image }} style={styles.bookImage} />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <View style={styles.ratingContainer}>
          {Array.from({ length: 5 }, (_, i) => (
            <Ionicons
              key={i}
              name={i + 1 <= item.rating ? "star" : "star-outline"}
              size={14}
              color={i + 1 <= item.rating ? "#f4b400" : COLORS.textSecondary}
              style={{ marginRight: 2 }}
            />
          ))}
        </View>
      </View>
      <Text style={styles.bookCaption} numberOfLines={2}>
        {item.caption}
      </Text>
      <Text style={styles.bookDate}>
        {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {selectedFriend ? (
        <>
          <TouchableOpacity
            onPress={() => {
              setSelectedFriend(null);
              setFriendPosts([]);
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#444" />
            <Text style={{ marginLeft: 6, fontSize: 16, fontWeight: "600" }}>
              Quay lại danh sách bạn
            </Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 10 }}>
            Bài viết của {selectedFriend.username}
          </Text>
          {postsLoading ? (
            <ActivityIndicator size="large" color="#2E7D32" />
          ) : (
            <FlatList
              data={friendPosts}
              keyExtractor={(item) => item._id}
              renderItem={renderPostItem}
              contentContainerStyle={{ paddingBottom: 20 }}
              ListEmptyComponent={
                <Text
                  style={{ color: "#999", textAlign: "center", marginTop: 20 }}
                >
                  Không có bài viết nào.
                </Text>
              }
            />
          )}
        </>
      ) : (
        <>
          <TextInput
            placeholder="🔍 Tìm bạn theo tên hoặc email..."
            value={searchText}
            onChangeText={setSearchText}
            style={{
              backgroundColor: "#fff",
              borderRadius: 8,
              padding: 10,
              marginBottom: 10,
              borderWidth: 1,
              borderColor: "#ddd",
            }}
          />
          <FlatList
            data={filteredFriends}
            keyExtractor={(item) => item._id}
            renderItem={renderFriendItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <Text
                style={{ color: "#999", textAlign: "center", marginTop: 20 }}
              >
                Không tìm thấy người dùng nào.
              </Text>
            }
          />
        </>
      )}
    </View>
  );
}
