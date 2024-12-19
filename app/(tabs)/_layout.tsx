import { Redirect, Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useUser } from '@clerk/clerk-expo';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useCameraContext } from '@/components/CameraContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user } = useUser();
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    // console.log('redirecting you');
    return <Redirect href="/auth" />;
  }

  async function getTempId() {
    try {
      let tempId = await AsyncStorage.getItem('tempId');
      if (!tempId) {
        tempId = uuidv4(); // Generate a new UUID
        await AsyncStorage.setItem('tempId', tempId || '');
      }
      return tempId;
    } catch (error) {
      console.error('Error with AsyncStorage:', error);
      throw error;
    }
  }

  async function addDocument() {
    const tempId = await getTempId();
    console.log('Starting to add document...'); // Add this
    try {
      const userQuery = query(
        collection(db, 'users'),
        where('tempId', '==', tempId)
      );
      const querySnapshot = await getDocs(userQuery);
      if (!querySnapshot.empty) {
        // Update the existing document
        const docId = querySnapshot.docs[0].id; // Get the document ID
        const userRef = doc(db, 'users', docId);

        await setDoc(
          userRef,
          {
            userId: user?.id, // Merge referral data
            userEmail: user?.emailAddresses[0].emailAddress,
          },
          { merge: true } // Ensure the update doesn't overwrite existing data
        );
      } else {
        // Create a new document if none exists
        await addDoc(collection(db, 'users'), {
          tempId: tempId,
          userId: user?.id, // Merge referral data
          userEmail: user?.emailAddresses[0].emailAddress,
        });
      }
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  }

  addDocument();

  // if (isSignedIn && user?.unsafeMetadata?.onboarding_completed !== true) {
  //   return <Redirect href="/auth" />;
  // }

  // const { cameraActive } = useCameraContext();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'dark'].tint,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#080815' : '#080815', // Change tab bar background color
          borderTopWidth: 0,
          // display: cameraActive ? 'none' : 'flex',
          ...Platform.select({
            ios: {
              position: 'absolute',
            },
            default: {},
          }),
        },
      }}
    >
      {/* <Tabs.Screen
        name="index"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="camera-outline" color={color} />
          ),
        }}
      /> */}

      <Tabs.Screen
        name="index"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="camera-outline" color={color} />
          ),
          tabBarStyle: {
            // display: cameraActive ? 'none' : 'flex',
            position: Platform.select({
              ios: 'absolute',
              default: undefined,
            }),
            borderTopWidth: 0,
            backgroundColor: colorScheme === 'dark' ? '#080815' : '#080815',
          },
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="settings-outline" color={color} />
          ),
        }}
      />
      {/* <Tabs.Screen
        name="pro"
        options={{
          title: 'pro',
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="settings-outline" color={color} />
          ),
        }}
      /> */}
    </Tabs>
  );
}
function uuidv4(): string | null {
  throw new Error('Function not implemented.');
}
