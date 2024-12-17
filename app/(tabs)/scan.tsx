import {
  CameraView,
  CameraType,
  useCameraPermissions,
  CameraCapturedPicture,
} from 'expo-camera';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCameraContext } from '@/components/CameraContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ScanScreen() {
  const { cameraActive, setCameraActive } = useCameraContext(); // Get both values from context
  const [facing, setFacing] = useState<CameraType>('back');
  const [zoom, setZoom] = useState(0);
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedPhotos, setCapturedPhotos] = useState<Array<{ uri: string }>>(
    []
  );
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    loadSavedPhotos();
  }, []);

  const loadSavedPhotos = useCallback(async () => {
    try {
      const savedPhotos = await AsyncStorage.getItem('capturedPhotos');
      if (savedPhotos) {
        setCapturedPhotos(JSON.parse(savedPhotos));
      }
    } catch (error) {
      console.error('Error loading saved photos', error);
    }
  }, []);

  const savePhoto = useCallback(
    async (newPhoto: { uri: string }) => {
      try {
        const updatedPhotos = [newPhoto, ...capturedPhotos];
        await AsyncStorage.setItem(
          'capturedPhotos',
          JSON.stringify(updatedPhotos)
        );
        setCapturedPhotos(updatedPhotos);
      } catch (error) {
        console.error('Error saving photo', error);
      }
    },
    [capturedPhotos]
  );

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const handleZoomChange = useCallback((value: number) => {
    setZoom(value);
  }, []);

  const takePicture = useCallback(async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: false,
        exif: false,
      });
      if (photo) {
        await savePhoto({ uri: photo.uri });
      }
    }
  }, [savePhoto]);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  if (!cameraActive) {
    return (
      <View style={styles.container}>
        <Text style={styles.headerText}>Scan your hair with AI</Text>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => setCameraActive(true)} // Use global state setter
        >
          <Ionicons name="camera" style={styles.startButtonIcon} />
          <Text style={styles.startButtonText}>Start Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        ref={cameraRef}
        zoom={zoom}
      >
        <View style={styles.buttonContainerCameraOptions}>
          <TouchableOpacity style={styles.button} onPress={takePicture}>
            <Text style={styles.text}>
              <Ionicons name="radio-button-on" style={styles.icon} />
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>
              <Ionicons name="camera-reverse" style={styles.icon} />
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setCameraActive(false)} // Use global state setter
          >
            <Text style={styles.text}>
              <Ionicons name="close-circle" style={styles.icon} />
            </Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    top: -250,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainerCameraOptions: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '80%',
  },
  button: {
    // paddingHorizontal: 10,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  icon: {
    fontSize: 60,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: '#702963',
    borderRadius: 30,
    padding: 15,
    marginTop: 20,
    width: '80%',
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  startButtonIcon: {
    fontSize: 24,
    color: 'white',
    marginRight: 10,
  },
});
