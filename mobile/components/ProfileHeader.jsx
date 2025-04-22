import { View, Text } from "react-native";
import { useAuthStore } from "../store/authStore";
import { Image } from "expo-image";
import styles from "../assets/styles/profile.style";

export default function ProfileHeader() {
  const { user } = useAuthStore();

  if (!user) return null;

  const formatMemberSince = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <View style={styles.profileHeader}>
      {user.profileImage && (
        <Image
          source={{ uri: user.profileImage }}
          style={styles.profileImage}
        />
      )}

      <View style={styles.profileInfo}>
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.memberSince}>
          📅 Joined {formatMemberSince(user.createdAt)}
        </Text>
      </View>
    </View>
  );
}
