import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { useAuthStore } from "../../store/authStore";
import { API_URL } from "../../constants/api";
import COLORS from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Notifications() {
  const { token } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const router = useRouter();

  const fetchNotifications = async () => {
    const res = await fetch(`${API_URL}/books/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const text = await res.text();
    console.log("⚠ Raw response:", text);

    let data;
    try {
      data = JSON.parse(text);
      setNotifications(data);
    } catch (err) {
      console.error("❌ JSON parse lỗi:", err.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => router.push(`/book/${item.bookId}`)}
        style={{
          padding: 12,
          borderBottomWidth: 1,
          borderColor: COLORS.border,
        }}
      >
        <Text>
          <Text style={{ fontWeight: "bold" }}>{item.username}</Text>{" "}
          {item.type === "like"
            ? "đã thích bài viết của bạn"
            : `đã bình luận: "${item.text}"`}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <FlatList
        data={notifications}
        keyExtractor={(_, i) => i.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 12 }}
      />
    </View>
  );
}
