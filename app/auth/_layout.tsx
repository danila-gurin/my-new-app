import { useAuth, useUser } from '@clerk/clerk-expo';
import { Redirect, usePathname } from 'expo-router';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Index from './index'; // Import the index component
import WashHair from './wash-hair'; // Import the wash-hair component
import ChooseGender from './choose-gender';
import Improvement from './improvement';
import HairLoss from './hair-loss';
import Nature from './nature';
import Age from './age';
import { useRouter } from 'expo-router';
import Notification from './notification';
import Referral from './referral';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
const Stack = createNativeStackNavigator();
import PageTransitionWrapper from '../../components/AnimatedPage';
import { NavigationContainer } from '@react-navigation/native';

export default function AuthLayout() {
  const { user } = useUser();
  const pathName = usePathname();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  // Guard: If the user is not signed in, show the auth flow
  // if (!isSignedIn) {
  //   return (
  //     <Stack.Navigator>
  //       <Stack.Screen
  //         options={{ headerShown: false }}
  //         name="index"
  //         component={Index}
  //       />
  //     </Stack.Navigator>
  //   );
  // }

  // Extract onboarding flags from user metadata
  // const hasChosenGender = user?.unsafeMetadata?.gender_chosen;
  // const hasChosenAge = user?.unsafeMetadata?.chosen_age;
  // const hasChosenImprovement = user?.unsafeMetadata?.chosen_improvement;
  // const hasChosenHair = user?.unsafeMetadata?.chosen_hair;
  // const hasChosenHistory = user?.unsafeMetadata?.chosen_history;
  // const hasChosenNature = user?.unsafeMetadata?.chosen_nature;
  // const hasChosenNotification = user?.unsafeMetadata?.chosen_notifications;

  // const hasCompletedReferral = user?.unsafeMetadata?.referral_complete;
  // const onboardingCompleted = user?.unsafeMetadata?.onboarding_completed;
  // const hasSignedIn = user?.unsafeMetadata?.signed_in;

  const [onboardingState, setOnboardingState] = useState({
    gender_chosen: false,
    referral_complete: false,
    improvement_chosen: false,
    hair_chosen: false,
    history_chosen: false,
    nature_chosen: false,
    age_chosen: false,
    notifications_chosen: false,
    signed_in: false,
    // ... other states
  });

  // console.log('Initial onboardingState:', onboardingState); // Log the initial value

  useEffect(() => {
    const loadState = async () => {
      try {
        const state = await AsyncStorage.getItem('onboardingState');
        if (state) {
          setOnboardingState(JSON.parse(state));
        }
      } catch (error) {
        console.error('Error loading onboarding state:', error);
      }
    };
    loadState();
  }, []);

  // Step 1: Redirect to "choose-gender" if gender is not chosen
  useEffect(() => {
    if (!onboardingState.gender_chosen && pathName !== '/auth/choose-gender') {
      router.push('/auth/choose-gender');
    } else if (
      onboardingState.gender_chosen &&
      !onboardingState.referral_complete &&
      pathName !== '/auth/referral'
    ) {
      router.push('/auth/referral');
    } else if (
      onboardingState.gender_chosen &&
      onboardingState.referral_complete &&
      !onboardingState.age_chosen &&
      pathName !== '/auth/age'
    ) {
      router.push('/auth/age');
    } else if (
      onboardingState.gender_chosen &&
      onboardingState.referral_complete &&
      onboardingState.age_chosen &&
      !onboardingState.improvement_chosen &&
      pathName !== '/auth/improvement'
    ) {
      router.push('/auth/improvement');
    } else if (
      onboardingState.gender_chosen &&
      onboardingState.referral_complete &&
      onboardingState.age_chosen &&
      onboardingState.improvement_chosen &&
      !onboardingState.hair_chosen &&
      pathName !== '/auth/wash-hair'
    ) {
      router.push('/auth/wash-hair');
    } else if (
      onboardingState.gender_chosen &&
      onboardingState.referral_complete &&
      onboardingState.age_chosen &&
      onboardingState.improvement_chosen &&
      onboardingState.hair_chosen &&
      !onboardingState.history_chosen &&
      pathName !== '/auth/hair-loss'
    ) {
      router.push('/auth/hair-loss');
    } else if (
      onboardingState.gender_chosen &&
      onboardingState.referral_complete &&
      onboardingState.age_chosen &&
      onboardingState.improvement_chosen &&
      onboardingState.hair_chosen &&
      onboardingState.history_chosen &&
      !onboardingState.nature_chosen &&
      pathName !== '/auth/nature'
    ) {
      router.push('/auth/nature');
    } else if (
      onboardingState.gender_chosen &&
      onboardingState.referral_complete &&
      onboardingState.age_chosen &&
      onboardingState.improvement_chosen &&
      onboardingState.hair_chosen &&
      onboardingState.history_chosen &&
      onboardingState.nature_chosen &&
      !onboardingState.notifications_chosen &&
      pathName !== '/auth/notification'
    ) {
      router.push('/auth/notification');
    } else if (
      onboardingState.gender_chosen &&
      onboardingState.referral_complete &&
      onboardingState.age_chosen &&
      onboardingState.improvement_chosen &&
      onboardingState.hair_chosen &&
      onboardingState.history_chosen &&
      onboardingState.nature_chosen &&
      onboardingState.notifications_chosen &&
      !onboardingState.signed_in &&
      pathName !== '/auth'
    ) {
      router.push('/auth');
    } else {
      // console.log('sending you to the main app');
      router.push('/(tabs)');
    }
  }, []);
  // console.log('onboardingState:', onboardingState);

  // Step 3: Redirect to home if onboarding is completed
  // console.log('onboardingState:', onboardingState);
  // console.log('gender chosen:', onboardingState.gender_chosen);
  // console.log('referral chosen:', onboardingState.referral_complete);
  // console.log('age chosen:', onboardingState.age_chosen);
  // console.log('improvement chosen:', onboardingState.improvement_chosen);

  // console.log('hair chosen:', onboardingState.hair_chosen);
  // console.log('history chosen:', onboardingState.history_chosen);
  // console.log('nature chosen:', onboardingState.nature_chosen);
  // console.log('notifications chosen:', onboardingState.notifications_chosen);
  // console.log('signed in:', onboardingState.signed_in);

  // if (onboardingCompleted)
  // Default Stack for Onboarding Screens
  return (
    <Stack.Navigator
      screenOptions={{
        animation: 'fade', // or 'slide_from_left', 'fade', etc.
        headerShown: false, // optional, if you don't want headers
        contentStyle: {
          backgroundColor: 'white', // or any color you prefer
        },
        // You can add custom animations using the following props
        animationTypeForReplace: 'push',
        animationDuration: 100,
      }}
    >
      <Stack.Screen
        name="choose-gender"
        options={{ headerShown: false }}
        component={ChooseGender}
      />
      <Stack.Screen
        name="referral"
        options={{ headerShown: false }}
        component={Referral}
      />
      <Stack.Screen
        name="age"
        options={{ headerShown: false }}
        component={Age}
      />
      <Stack.Screen
        name="improvement"
        options={{ headerShown: false }}
        component={Improvement}
      />
      <Stack.Screen
        name="wash-hair"
        options={{ headerShown: false }}
        component={WashHair}
      />
      <Stack.Screen
        name="hair-loss"
        options={{ headerShown: false }}
        component={HairLoss}
      />
      <Stack.Screen
        name="nature"
        options={{ headerShown: false }}
        component={Nature}
      />
      <Stack.Screen
        name="notification"
        options={{ headerShown: false }}
        component={Notification}
      />
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
        component={Index}
      />
    </Stack.Navigator>
  );
}
