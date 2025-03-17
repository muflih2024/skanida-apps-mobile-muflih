// app/register.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { YStack, Text, Button, Input } from "tamagui";

import useAuthStore from "../store/authStore";

import { supabase } from "~/utils/supabase";

export default function RegisterScreen() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegister = async () => {
    setLoading(true);
    setErrorMessage("");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      // Jika Anda menggunakan "magic link" atau email verification yang dikirim otomatis,
      // Supabase akan mengirim link verifikasi ke email pengguna.
    });
    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    // Berhasil signUp
    if (data?.user) {
      // Cek apakah email sudah terverifikasi
      if (data.user.email_confirmed_at) {
        // Jika email sudah terverifikasi (mungkin user sudah pernah daftar, dll.)
        setUser(data.user);
        router.replace("/AuthSelector");
      } else {
        // Email belum terverifikasi
        alert(
          "Pendaftaran berhasil, namun email Anda belum terverifikasi. Silakan cek inbox untuk memverifikasi email.",
        );
        // Opsional: Anda bisa mengarahkan ke screen lain, misalnya '/please-verify'
        // router.replace('/please-verify')
      }
    }
  };

  return (
    <YStack flex={1} jc="center" ai="center" padding="$4" space>
      <Text fontSize="$5" fontWeight="bold">
        Daftar Akun
      </Text>
      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        size="$4"
        w="80%"
      />
      <Input
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        size="$4"
        w="80%"
      />
      {errorMessage ? (
        <Text color="red" fontSize="$3">
          {errorMessage}
        </Text>
      ) : null}
      <Button onPress={handleRegister} disabled={loading} mt="$3">
        {loading ? "Loading..." : "Register"}
      </Button>
      <Button onPress={() => router.push("/Login")} mt="$2">
        Sudah punya akun? Login
      </Button>
    </YStack>
  );
}
