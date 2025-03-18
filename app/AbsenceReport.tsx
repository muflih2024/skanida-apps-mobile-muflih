import React, { useState, useEffect } from "react";
import { YStack, XStack, Text, Button, Input } from "tamagui";
import { Alert } from "react-native";
import { supabase } from "~/utils/supabase";
import { useRouter } from "expo-router";

const AbsenceReport = () => {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [reason, setReason] = useState("");
  const [className, setClassName] = useState("");
  const [attendanceStatus, setAttendanceStatus] = useState("Tidak Hadir");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) {
          Alert.alert("Error", "Failed to retrieve user information.");
          router.push("/Login"); // Redirect to login if user is not authenticated
          return;
        }
        setUserId(userData.user.id);

        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", userData.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError.message);
          Alert.alert("Error", "Failed to retrieve user profile.");
        } else if (profileData?.full_name) {
          setFullName(profileData.full_name);
        } else {
          Alert.alert("Error", "No profile found for the user.");
        }
      } catch (exception) {
        console.error("Unexpected error:", exception);
        Alert.alert("Error", "An unexpected error occurred while retrieving user information.");
      }
    };

    fetchUserData();
  }, []);

  const handleSubmit = async () => {
    if (!date || !reason || !className || !userId) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("absences")
        .insert([
          {
            user_id: userId,
            full_name: fullName || "Unknown",
            date,
            reason,
            attendance_status: attendanceStatus,
            class_name: className,
            class: className, // Provide a value for the class column
            absence: "Some value", // Provide a value for the absence column
          },
        ]);

      if (error) {
        console.error("Error inserting absence:", error.message);
        Alert.alert("Error", "Failed to report attendance.");
      } else {
        Alert.alert("Success", "Attendance reported successfully.");
        router.push("/Home");
      }
    } catch (exception) {
      console.error("Unexpected error:", exception);
      Alert.alert("Error", "An unexpected error occurred while submitting attendance.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <YStack flex={1} jc="center" ai="center" space="$4" padding="$4">
      <Text fontSize="$6" fontWeight="bold">
        Report Attendance
      </Text>

      <Input
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
        width="100%"
        editable={!fullName} // Disable if already fetched from profile
        maxLength={32} // Limit input to 32 characters
      />

      <Input placeholder="Date (YYYY-MM-DD)" value={date} editable={false} width="100%" />

      <Input placeholder="Reason" value={reason} onChangeText={setReason} width="100%" />

      <Input placeholder="Class Name" value={className} onChangeText={setClassName} width="100%" />

      <Text>Status:</Text>
      <XStack space="$2">
        <Button
          backgroundColor={attendanceStatus === "Hadir" ? "green" : "gray"}
          onPress={() => setAttendanceStatus("Hadir")}
        >
          Hadir
        </Button>
        <Button
          backgroundColor={attendanceStatus === "Tidak Hadir" ? "red" : "gray"}
          onPress={() => setAttendanceStatus("Tidak Hadir")}
        >
          Tidak Hadir
        </Button>
      </XStack>

      <Button
        onPress={handleSubmit}
        backgroundColor="$blue10"
        width="100%"
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit Attendance"}
      </Button>
    </YStack>
  );
};

export default AbsenceReport;