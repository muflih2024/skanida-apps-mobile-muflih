import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { View, Text, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
// Hapus import Camera jika tidak dipakai di sini
// import { Camera } from 'expo-camera';
import { supabase } from '~/utils/supabase';

const AbsenceReport = () => {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isWithinRange, setIsWithinRange] = useState(false);
  const router = useRouter();

  const SMK_LOCATION = { latitude: -7.556058, longitude: 110.831663 };
  const MAX_DISTANCE = 500;

  useEffect(() => {
    const fetchUserDataAndLocation = async () => {
      setLoading(true); // Mulai loading
      try {
        // 1. Get User
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) {
          console.error('User auth error:', userError?.message);
          Alert.alert('Error', 'Failed to retrieve user. Please log in again.');
          router.replace('/attendance/CameraAttendance'); // Gunakan replace agar tidak bisa kembali
          return; // Hentikan eksekusi
        }
        setUserId(userData.user.id);

        // 2. Get Location Permission
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is required to submit attendance.');
          // Mungkin arahkan ke home atau tampilkan pesan permanen
          setIsWithinRange(false); // Anggap di luar jangkauan jika izin ditolak
          setLoading(false);
          return; // Hentikan eksekusi
        }

        // 3. Get Current Location
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);

        // 4. Calculate Distance
        const distance = calculateDistance(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude,
          SMK_LOCATION.latitude,
          SMK_LOCATION.longitude
        );
        console.log("Distance: ", distance); // Log jarak untuk debug

        setIsWithinRange(distance <= MAX_DISTANCE);

      } catch (exception: any) {
        console.error('Error fetching data or location:', exception);
        Alert.alert('Error', 'An unexpected error occurred while getting location or user data.');
        // Pertimbangkan untuk menampilkan tombol retry atau mengarahkan user
      } finally {
          setLoading(false); // Selesai loading
      }
    };

    fetchUserDataAndLocation();
  }, [router]); // Tambahkan dependency router

  // Hapus useEffect untuk izin kamera

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    // ... (fungsi calculateDistance tetap sama) ...
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371e3; // Earth radius in meters
    const lat1Rad = toRad(lat1);
    const lat2Rad = toRad(lat2);
    const deltaLat = toRad(lat2 - lat1);
    const deltaLon = toRad(lon2 - lon1);

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) *
      Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const handleRetryLocation = async () => {
    setLoading(true);
     try {
        const { status } = await Location.requestForegroundPermissionsAsync();
         if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is required.');
          setLoading(false);
          return;
        }
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
        const distance = calculateDistance(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude,
          SMK_LOCATION.latitude,
          SMK_LOCATION.longitude
        );
        setIsWithinRange(distance <= MAX_DISTANCE);
     } catch (error) {
         console.error("Retry location error:", error);
         Alert.alert('Error', 'Could not get location.');
     } finally {
        setLoading(false);
     }
  };

  const handleSubmitLocationAndDate = async () => {
    if (!userId || !location) {
      Alert.alert('Error', 'User or location data is missing. Please retry.');
      return;
    }
    if (!isWithinRange) {
       Alert.alert('Error', 'You are still outside the allowed range.');
       return;
    }

    setLoading(true); // Tampilkan loading saat submit
    try {
      const { data, error } = await supabase.from('absences').insert([
        {
          user_id: userId,
          date: new Date().toISOString(), // Gunakan waktu saat ini
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          status: 'Present', // Contoh status awal, sesuaikan
        },
      ]).select().single(); // Ambil data yang baru saja diinsert (opsional, tapi berguna jika butuh ID)

      if (error) {
        console.error('Insert error:', error.message);
        Alert.alert('Error', `Failed to submit location: ${error.message}`);
      } else {
        console.log('Absence record created:', data); // Log data yang berhasil disimpan
        Alert.alert('Success', 'Location submitted successfully. Proceed to take picture.');
        // Navigasi ke halaman Kamera setelah sukses
        router.push('/attendance/CameraAttendance');
        // Anda mungkin ingin mengirim ID absensi ke halaman berikutnya:
        // router.push(`/attendance/CameraAttendance?absenceId=${data.id}`);
      }
    } catch (exception: any) {
      console.error('Unexpected error during submission:', exception);
      Alert.alert('Error', 'An unexpected error occurred while submitting location.');
    } finally {
        setLoading(false); // Sembunyikan loading
    }
  };

  // --- Render Logic ---

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Checking location and user data...</Text>
      </View>
    );
  }

  if (!isWithinRange) {
    return (
      <View className="flex-1 items-center justify-center space-y-4 p-4">
        <Text className="text-xl font-bold text-center text-red-500">You are outside the allowed range.</Text>
         <Text className="text-center">Move closer to the required location ({MAX_DISTANCE}m range).</Text>
        <TouchableOpacity
          onPress={handleRetryLocation}
          disabled={loading}
          className={`rounded-md p-3 mt-4 ${loading ? 'bg-gray-400' : 'bg-blue-500'}`}>
          <Text className="text-center text-white">
            {loading ? 'Checking...' : 'Check Location Again'}
            </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Jika dalam jangkauan, tampilkan tombol submit
  return (
    <View className="flex-1 items-center justify-center space-y-4 p-4">
      <Text className="text-2xl font-bold">Location Verified</Text>
      <Text className="text-center text-green-600 mb-4">You are within the allowed range.</Text>
      <Text className="text-center">Press the button below to record your location and proceed to take a picture.</Text>

      <TouchableOpacity
        onPress={handleSubmitLocationAndDate}
        disabled={loading}
        className={`w-full rounded-md p-3 mt-5 ${loading ? 'bg-gray-400' : 'bg-blue-500'}`}>
        <Text className="text-center text-white text-lg">
            {loading ? 'Submitting...' : 'Submit Location & Proceed'}
        </Text>
      </TouchableOpacity>
       {/* Loading indicator kecil saat proses submit */}
       {loading && <ActivityIndicator size="small" color="#0000ff" style={{ marginTop: 15 }} />}
    </View>
  );
};

export default AbsenceReport;