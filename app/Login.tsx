// app/Login.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { YStack, Text, Button, Input } from "tamagui";

import useAuthStore from "../store/authStore";
import { supabase } from "../utils/supabase";

export default function Login() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setErrorMessage("");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setErrorMessage(error.message);
    } else {
      setUser(data.user);
      router.replace("/Home");
    }
  };

  return (
    <>
      <YStack flex={1} jc="center" ai="center" space>
        <Text fontSize="$5" mb="$3">
          Login
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
        <Button onPress={handleLogin} disabled={loading} mt="$3">
          {loading ? "Loading..." : "Login"}
        </Button>
      </YStack>
    </>
  );
}
