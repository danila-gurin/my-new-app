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

      await user?.update({
        unsafeMetadata: {
          gender_chosen: true,
          referral_complete: true,
          chosen_age: true,
          chosen_improvement: true,
          chosen_hair: true,
          chosen_history: true,
          chosen_nature: true,
          chosen_notifications: true,
          onboarding_completed: true,
        },
      });

      await user?.reload();

      router.push('/(tabs)');
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

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handleNotificationSetup = async () => {
    await registerForPushNotificationsAsync();
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
          <ProgressLineWithCircles currentStep={8} />
          <Text style={styles.label}>Enable Notifications</Text>
        </View>

        {/* Circle with Bell */}
        <View style={styles.circleContainer}>
          <View style={styles.circle}>
            <Image
              source={require('@/constants/bell-removebg-preview.png')}
              style={styles.bellImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Submit Button */}
        <View style={{ marginTop: 20 }}>
          <TouchableOpacity
            style={[styles.button, { opacity: isLoading ? 0.7 : 1 }]}
            onPress={handleNotificationSetup} // Trigger notification permission
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : null}
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
    marginTop: 40,
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
});
