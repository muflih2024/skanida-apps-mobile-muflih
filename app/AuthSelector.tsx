// app/login.tsx
import { useRouter, Stack } from "expo-router";
import React from "react";
import { YStack, Button, Text } from "tamagui";

export default function LoginScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false, // Jika Anda ingin menghilangkan seluruh header, bisa pakai ini
        }}
      />
      <YStack flex={1} jc="center" ai="center" space>
        <Text fontSize="$5" mb="$3">
          Silahkan Login atau Register
        </Text>
        <Button onPress={() => router.push("/Login")}>Login</Button>
        <Button onPress={() => router.push("/Register")}>Register</Button>
      </YStack>
    </>
  );
}
