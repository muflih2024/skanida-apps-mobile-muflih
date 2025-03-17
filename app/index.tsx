import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Spinner, YStack } from "tamagui";

import useAuthStore from "../store/authStore";
import { supabase } from "../utils/supabase";

export default function SplashScreen() {
  const setUser = useAuthStore((state) => state.setUser);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Memanggil Supabase untuk cek session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) {
          console.log("Terjadi error saat mengambil session:", error.message);
        }

        console.log("Session =>", session);

        if (session?.user) {
          // Jika ada user
          setUser(session.user);
          router.replace("/Home");
        } else {
          // Jika tidak ada session
          router.replace("/AuthSelector");
        }
      } catch (err) {
        // Tangani error tak terduga
        console.log("Error tak terduga:", err);
      }
    };

    checkAuth();
  }, [router, setUser]);

  return (
    <YStack flex={1} jc="center" ai="center">
      <Spinner size="large" />
    </YStack>
  );
}
