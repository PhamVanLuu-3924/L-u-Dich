import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { Title } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "../store/authStore";
import COLORS from "../constants/colors";
import { useRouter } from "expo-router";
import { Image } from "expo-image";

const DrawerList = [
  { icon: "plus-box-outline", label: "Create", navigateTo: "/(tabs)/create" },
  { icon: "account", label: "Profile", navigateTo: "/(tabs)/profile" },
  { icon: "account-multiple", label: "User", navigateTo: "/(tabs)/user" },
  { icon: "account-heart", label: "Friends", navigateTo: "/(tabs)/friends" },
];

const DrawerLayout = ({ icon, label, navigateTo, router }) => {
  return (
    <DrawerItem
      icon={({ color, size }) => <Icon name={icon} color={color} size={size} />}
      label={label}
      labelStyle={{ color: COLORS.textPrimary }}
      onPress={() => router.push(navigateTo)}
    />
  );
};

const DrawerContent = (props) => {
  const router = useRouter();
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();

  const signOut = async () => {
    await AsyncStorage.multiRemove(["isLoggedIn", "token"]);
    logout();
    router.replace("/(auth)");
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <DrawerContentScrollView {...props}>
        <View style={styles.drawerContent}>
          <View style={styles.userInfoSection}>
            <View
              style={{
                flexDirection: "row",
                marginTop: 15,
                alignItems: "center",
              }}
            >
              <Image
                source={{ uri: user?.profileImage }}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: COLORS.border,
                }}
                contentFit="cover"
              />
              <View style={{ marginLeft: 10 }}>
                <Title style={styles.title}>{user?.username || "Guest"}</Title>
                <Text style={styles.caption} numberOfLines={1}>
                  {user?.email || "guest@example.com"}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.drawerSection}>
            {DrawerList.map((item, i) => (
              <DrawerLayout key={i} {...item} router={router} />
            ))}
          </View>
        </View>
      </DrawerContentScrollView>
      <View style={styles.bottomDrawerSection}>
        <DrawerItem
          onPress={signOut}
          icon={({ color, size }) => (
            <Icon name="exit-to-app" color={color} size={size} />
          )}
          label="Sign Out"
          labelStyle={{ color: COLORS.textPrimary }}
        />
      </View>
    </View>
  );
};

export default DrawerContent;

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    paddingHorizontal: 10,
  },
  userInfoSection: {
    paddingLeft: 20,
  },
  title: {
    fontSize: 16,
    marginTop: 3,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  caption: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  drawerSection: {
    marginTop: 15,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    paddingTop: 10,
  },
  bottomDrawerSection: {
    marginBottom: 15,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
  },
});
