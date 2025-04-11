import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
// --- Import CameraView ---
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router'; // Opsional: jika perlu navigasi

const CameraAttendance = () => {
  // --- Ref untuk CameraView ---
  const cameraRef = useRef<CameraView>(null); // Gunakan CameraView untuk ref

  // --- Gunakan hook useCameraPermissions ---
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back'); // State untuk arah kamera ('back' atau 'front')

  const [isTakingPicture, setIsTakingPicture] = useState(false);
  const router = useRouter(); // Opsional

  // Meminta izin saat komponen dimuat jika belum diberikan
  useEffect(() => {
    if (!permission) {
      // Izin masih loading
      return;
    }
    if (!permission.granted) {
      // Minta izin jika belum diberikan
       console.log("Requesting camera permission...");
      requestPermission();
    }
  }, [permission, requestPermission]); // Tambahkan requestPermission sebagai dependency

  const takePicture = async () => {
    if (cameraRef.current && !isTakingPicture) {
      setIsTakingPicture(true);
      try {
        const options = { quality: 0.7, base64: false, skipProcessing: true };
        // --- Gunakan takePictureAsync dari CameraView ref ---
        const photo = await cameraRef.current.takePictureAsync(options);

        if (photo) {
            console.log('Photo URI:', photo.uri);
            Alert.alert('Success', 'Photo captured successfully!');
            // !!! Implementasikan upload & navigasi di sini !!!
            // Contoh:
            // await uploadPhoto(photo.uri);
            // router.replace('/success');
        } else {
            Alert.alert('Error', 'Failed to capture photo (no data returned).');
        }

        // setIsTakingPicture(false); // Hapus jika ada navigasi

      } catch (err) {
        console.error('Error taking picture:', err);
        Alert.alert('Error', 'Failed to capture photo.');
      } finally {
          // Pastikan loading selesai meskipun ada error atau tidak ada navigasi
          setIsTakingPicture(false);
      }
    } else if (isTakingPicture) {
       console.log("Capture in progress...");
    } else {
       Alert.alert('Error', 'Camera reference not available.');
    }
  };

  // Fungsi flip kamera
  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  // Render logic berdasarkan status izin
  if (!permission) {
    // Izin belum termuat
    return (
       <View style={styles.container}>
         <ActivityIndicator size="large" color="#0000ff" />
         <Text style={styles.messageText}>Loading permissions...</Text>
       </View>
    );
  }

  if (!permission.granted) {
    // Izin ditolak atau belum diminta
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>We need your permission to show the camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
            <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render kamera jika izin diberikan
  return (
    <View style={styles.container}>
      {/* --- Gunakan CameraView --- */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing} // Gunakan prop 'facing'
        // mode="picture" // Defaultnya picture, bisa juga 'video'
        // barcodeScannerSettings={{...}} // Jika perlu scan barcode
      >
        <View style={styles.buttonContainer}>
           {/* Tombol Flip */}
           <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
              <Text style={styles.flipButtonText}>🔄</Text>
           </TouchableOpacity>
          {/* Tombol Capture */}
          <TouchableOpacity
            style={[styles.captureButton, isTakingPicture ? styles.captureButtonDisabled : {}]}
            onPress={takePicture}
            disabled={isTakingPicture}
          >
            {isTakingPicture ? <ActivityIndicator size="small" color="#ffffff" /> : <View style={styles.captureButtonInner} />}
          </TouchableOpacity>
          {/* Placeholder agar tombol capture tetap di tengah */}
          <View style={styles.flipButtonPlaceholder} />
        </View>
      </CameraView>
    </View>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', // Align items for permission screens
    backgroundColor: '#f0f0f0' // Background for permission screens
  },
  camera: {
    flex: 1,
    width: '100%', // Pastikan kamera mengisi lebar
    justifyContent: 'flex-end', // Dorong tombol ke bawah
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Space out flip and capture controls
    alignItems: 'center', // Align items vertically
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 30,
    paddingVertical: 20, // Padding atas bawah
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ffffff', // Warna luar putih
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.5)', // Border sedikit transparan
  },
  captureButtonDisabled: {
    backgroundColor: '#a0a0a0', // Warna saat disabled
  },
  captureButtonInner: {
     width: 56, // Lingkaran dalam
     height: 56,
     borderRadius: 28,
     backgroundColor: '#ff0000', // Warna merah di dalam (atau putih)
  },
  flipButton: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
   flipButtonPlaceholder: { // Untuk menyeimbangkan tombol flip
      width: 40, // Sesuaikan ukuran dengan tombol flip
      height: 40,
   },
  flipButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  permissionText: {
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 20,
    color: '#333',
  },
  messageText: {
     marginTop: 10,
     color: '#555',
  },
  button: {
     backgroundColor: '#007AFF', // Warna biru standar iOS
     paddingHorizontal: 20,
     paddingVertical: 10,
     borderRadius: 8,
  },
  buttonText: {
     color: '#fff',
     fontSize: 16,
     fontWeight: 'bold',
  }
});

export default CameraAttendance;