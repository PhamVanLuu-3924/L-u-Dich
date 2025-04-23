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
import { useIsFocused } from "@react-navigation/native";
import { Image } from "expo-image";
import { API_URL } from "../../constants/api";
import { useAuthStore } from "../../store/authStore";
import styles from "../../assets/styles/user";

export default function UserListScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);
  const [hiddenUserIds, setHiddenUserIds] = useState([]);
  const [searchText, setSearchText] = useState("");

  const { token } = useAuthStore();
  const isFocused = useIsFocused();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/users/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      // Lấy số sách từng người dùng
      const res2 = await fetch(`${API_URL}/books/by-user-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const counts = await res2.json(); // [{ userId, count }]

      const merged = data.map((u) => {
        const found = counts.find((c) => c.userId === u._id);
        return { ...u, bookCount: found ? found.count : 0 };
      });

      setUsers(merged);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch users or post count");
    } finally {
      setLoading(false);
    }
  };

  const fetchFriendsAndUpdateHidden = async () => {
    try {
      const res = await fetch(`${API_URL}/users/friends`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const currentFriendIds = data.map((f) => f._id);
      setHiddenUserIds((prev) =>
        prev.filter((id) => currentFriendIds.includes(id))
      );
    } catch (error) {
      console.log("Error checking friends", error);
    }
  };

  const addFriend = async (friendId) => {
    try {
      setAddingId(friendId);
      const res = await fetch(`${API_URL}/users/friends/${friendId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      Alert.alert("✅", "Friend added!");
      setHiddenUserIds((prev) => [...prev, friendId]);
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to add friend");
    } finally {
      setAddingId(null);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchFriendsAndUpdateHidden();
      fetchUsers();
    }
  }, [isFocused]);

  const renderItem = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.infoBox}>
        <Image source={{ uri: item.profileImage }} style={styles.avatar} />
        <View style={styles.nameEmail}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.email}>{item.email}</Text>
          <Text style={{ fontSize: 12, color: "#888" }}>
            📚 {item.bookCount} bài viết
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => addFriend(item._id)}
        disabled={addingId === item._id}
      >
        <Text style={styles.buttonText}>
          {addingId === item._id ? "..." : "Kết bạn"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const filteredUsers = users.filter(
    (u) =>
      !hiddenUserIds.includes(u._id) &&
      (u.username.toLowerCase().includes(searchText.toLowerCase()) ||
        u.email.toLowerCase().includes(searchText.toLowerCase()))
  );

  if (loading) return <ActivityIndicator size="large" color="#2E7D32" />;

  return (
    <View style={styles.container}>
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
        data={filteredUsers}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: "#888", marginTop: 20 }}>
            Không tìm thấy người dùng phù hợp.
          </Text>
        }
      />
    </View>
  );
}
