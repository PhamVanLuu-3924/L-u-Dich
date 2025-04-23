import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import styles from "../../assets/styles/login.styles.js";
import { useState } from "react";
import COLORS from "../../constants/colors.js";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const { isLoading, login, isCheckingAuth } = useAuthStore();

  const isValidEmailDomain = (email) => {
    return email.endsWith("@gmail.com") || email.endsWith("@hotmail.com");
  };

  const handleLogin = async () => {
    let hasError = false;
    setEmailError("");
    setPasswordError("");

    if (!email) {
      setEmailError("Vui lòng nhập email");
      hasError = true;
    } else if (!isValidEmailDomain(email)) {
      setEmailError("Email không đúng định dạng");
      hasError = true;
    }

    if (!password) {
      setPasswordError("Vui lòng nhập mật khẩu");
      hasError = true;
    }

    if (hasError) return;

    const result = await login(email, password);
    if (!result.success) {
      let message = result.error;
      Alert.alert("Thông báo", message);
    } else {
      Alert.alert("Thành công", "Đăng nhập thành công!");
    }
  };

  if (isCheckingAuth) return null;

  return (
    <View style={styles.container}>
      {/* ILLUSTRATION */}
      <View style={styles.topIllustration}>
        <Image
          source={require("../../assets/images/i.png")}
          style={styles.illustrationImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.card}>
        <View style={styles.formContainer}>
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
                placeholder="Nhập email"
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
                <Text style={{ color: "red", fontSize: 12 }}>{emailError}</Text>
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
                placeholder="Nhập mật khẩu"
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

          {/* LOGIN BUTTON */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Đăng nhập</Text>
            )}
          </TouchableOpacity>

          {/* FOOTER */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Chưa có tài khoản?</Text>
            <Link href="/signup" asChild>
              <TouchableOpacity>
                <Text style={styles.link}>Đăng ký</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </View>
  );
}
