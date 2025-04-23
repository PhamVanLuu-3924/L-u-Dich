import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import styles from "../../assets/styles/login.styles";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import { useState } from "react";
import { router } from "expo-router";
import { useAuthStore } from "../../store/authStore";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Error state
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const { isLoading, register } = useAuthStore();

  const isValidEmailDomain = (email) => {
    return email.endsWith("@gmail.com") || email.endsWith("@hotmail.com");
  };

  const handleRegister = async () => {
    let hasError = false;

    setUsernameError("");
    setEmailError("");
    setPasswordError("");

    if (!username) {
      setUsernameError("Vui lòng nhập tên người dùng");
      hasError = true;
    } else if (username.length < 3) {
      setUsernameError("Tên người dùng phải có ít nhất 3 ký tự");
      hasError = true;
    }

    if (!email) {
      setEmailError("Vui lòng nhập email");
      hasError = true;
    } else if (!isValidEmailDomain(email)) {
      setEmailError("Email phải là @gmail.com hoặc @hotmail.com");
      hasError = true;
    }

    if (!password) {
      setPasswordError("Vui lòng nhập mật khẩu");
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError("Mật khẩu phải có ít nhất 6 ký tự");
      hasError = true;
    }

    if (hasError) return;

    const result = await register(username, email, password);

    if (!result.success) {
      Alert.alert("Thông báo", result.error);
    } else {
      Alert.alert("Thành công", "Đăng ký thành công!");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>BookWorm🐉</Text>
            <Text style={styles.subtitle}>
              Chia sẻ những cuốn sách yêu thích
            </Text>
          </View>

          <View style={styles.formContainer}>
            {/* USERNAME */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tên người dùng</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Van Luu"
                  placeholderTextColor={COLORS.placeholderText}
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    if (usernameError) setUsernameError("");
                  }}
                  autoCapitalize="none"
                />
              </View>
              {!!usernameError && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 4,
                  }}
                >
                  <Ionicons
                    name="alert-circle-outline"
                    size={14}
                    color="red"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={{ color: "red", fontSize: 12 }}>
                    {usernameError}
                  </Text>
                </View>
              )}
            </View>

            {/* EMAIL */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="vanluudz@gmail.com"
                  placeholderTextColor={COLORS.placeholderText}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) setEmailError("");
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {!!emailError && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 4,
                  }}
                >
                  <Ionicons
                    name="alert-circle-outline"
                    size={14}
                    color="red"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={{ color: "red", fontSize: 12 }}>
                    {emailError}
                  </Text>
                </View>
              )}
            </View>

            {/* PASSWORD */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mật khẩu</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="******"
                  placeholderTextColor={COLORS.placeholderText}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) setPasswordError("");
                  }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              </View>
              {!!passwordError && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 4,
                  }}
                >
                  <Ionicons
                    name="alert-circle-outline"
                    size={14}
                    color="red"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={{ color: "red", fontSize: 12 }}>
                    {passwordError}
                  </Text>
                </View>
              )}
            </View>

            {/* SIGNUP BUTTON */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Đăng ký</Text>
              )}
            </TouchableOpacity>

            {/* FOOTER */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Đã có tài khoản?</Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.link}>Đăng nhập</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
