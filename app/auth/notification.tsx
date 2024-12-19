import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Keyboard,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { useEffect, useState } from 'react';
import ProgressLineWithCircles from '@/components/ProgressBarWithCircles';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationScreen = () => {
  const { user, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { control, handleSubmit, setValue } = useForm({
    defaultValues: {
      gender: '',
    },
  });

  const onSubmit = async (data: any) => {
    const { gender } = data;

    try {
      setIsLoading(true);

      const currentState = await AsyncStorage.getItem('onboardingState');
      const newState = {
        ...(currentState ? JSON.parse(currentState) : {}),
        notifications_chosen: true,
      };
      await AsyncStorage.setItem('onboardingState', JSON.stringify(newState));

      router.push('/auth');
    } catch (error: any) {
      console.error('Error updating user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to ask for notification permissions
  async function registerForPushNotificationsAsync() {
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Permission not granted for push notifications!');
        return;
      }

      // Get Expo Push Token
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;

      try {
        const pushTokenString = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
        console.log('Push Token:', pushTokenString);
        setExpoPushToken(pushTokenString);
      } catch (e: any) {
        console.error('Error getting push token:', e);
      }
    } else {
      alert('Must use physical device for push notifications');
    }
  }

  const handleNotificationSetup = async () => {
    await registerForPushNotificationsAsync();
  };

  const handleContinue = async () => {
    handleSubmit(onSubmit)();
  };

  useEffect(() => {
    if (isLoaded && user) {
      const existingGender = String(user?.unsafeMetadata?.gender) || '';
      if (existingGender) {
        setValue('gender', existingGender);
      }
    }
  }, [isLoaded, user, setValue]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + 40,
            paddingBottom: insets.bottom,
            backgroundColor: '#080815',
          },
        ]}
      >
        {/* Heading Section */}
        <View style={styles.headingContainer}>
          <TouchableOpacity
            style={styles.goBackButton}
            onPress={async () => {
              try {
                const currentState = await AsyncStorage.getItem(
                  'onboardingState'
                );
                // Update user's metadata
                const newState = {
                  ...(currentState ? JSON.parse(currentState) : {}),
                  notifications_chosen: false,
                };
                await AsyncStorage.setItem(
                  'onboardingState',
                  JSON.stringify(newState)
                );

                // Navigate to the choose-gender screen
                router.back();
              } catch (error) {
                console.error('Error updating user metadata:', error);
              }
            }}
          >
            <Ionicons
              name="arrow-back-outline"
              color="#4485ff"
              size={35}
            ></Ionicons>
          </TouchableOpacity>
          <ProgressLineWithCircles currentStep={8} />
          <Text style={styles.label}>Enable Notifications</Text>
        </View>

        {/* Circle with Bell */}
        <View style={styles.circleContainer}>
          <TouchableOpacity onPress={handleNotificationSetup}>
            {/* Added onPress here */}
            <View style={styles.circle}>
              <Image
                source={require('@/constants/bell-removebg-preview.png')}
                style={styles.bellImage}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <View style={{ marginTop: 20 }}>
          <TouchableOpacity
            style={[styles.button, { opacity: isLoading ? 0.7 : 1 }]}
            disabled={isLoading}
            onPress={handleContinue}
          >
            {/* {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : null} */}
            <LinearGradient
              colors={[
                'rgba(2,0,36,1)',
                'rgba(9,9,121,1)',
                'rgba(0,212,255,1)',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.button,
                {
                  borderWidth: 1,
                  borderTopColor: '#4485ff',
                  borderLeftColor: '#4485ff',
                  borderRightColor: '#4485ff',
                  borderBottomColor: '#97cbf7',
                },
              ]}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Loading' : 'Continue'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    gap: 0,
  },
  headingContainer: {
    width: '100%',
    gap: 5,
  },
  circleContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  circle: {
    width: 250,
    height: 250,
    borderRadius: 800,
    backgroundColor: '#161d2e',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellImage: {
    width: 140,
    height: 140,
  },
  label: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    padding: 20,
    borderRadius: 30,
    top: 59,
    borderColor: 'white',
    justifyContent: 'center',
    width: 325,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'semibold',
    fontSize: 18,
  },
  goBackButton: {
    position: 'absolute',
    left: 0,
    top: 13,
    borderWidth: 1, // Adding border width
    backgroundColor: '#383d45', // Define the color of the border
    borderRadius: 50, // Optional: To make it rounded, adjust as needed
    padding: 5, // Optional: Adjust padding for better appearance
  },
});
