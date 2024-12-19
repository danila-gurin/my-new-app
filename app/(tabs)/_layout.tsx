import { Redirect, Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useUser } from '@clerk/clerk-expo';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
// import { useCameraContext } from '@/components/CameraContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user } = useUser();
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <Redirect href="/auth" />;
  }

  if (isSignedIn && user?.unsafeMetadata?.onboarding_completed !== true) {
    return <Redirect href="/auth" />;
  }

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
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="home" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="scan"
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
