import SocialLoginButton from '@/components/SocialLoginButton';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-expo';
import ProgressLineWithCircles from '@/components/ProgressBarWithCircles';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useWarmUpBrowser = () => {
  useEffect(() => {
    // Warm up the android browser to improve UX
    // https://docs.expo.dev/guides/authentication/#improving-user-experience
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

WebBrowser.maybeCompleteAuthSession();

const AuthScreen = () => {
  useWarmUpBrowser();
  const insets = useSafeAreaInsets();
  return (
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
        <ProgressLineWithCircles currentStep={9} />
        <Text style={styles.label}>Login on Hairmax AI</Text>
        <Text style={styles.description}>
          Start your journey to improving your hair.
        </Text>
      </View>

      <View style={styles.socialButtonsContainer}>
        {/* <SocialLoginButton strategy="facebook" /> */}
        <SocialLoginButton strategy="google" />
        <SocialLoginButton strategy="apple" />
      </View>
    </View>
  );
};

export default AuthScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    gap: 20,
  },
  headingContainer: {
    width: '100%',
    gap: 5,
  },
  label: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    color: 'gray',
  },
  socialButtonsContainer: {
    width: '100%',
    marginTop: 20,
    gap: 10,
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
