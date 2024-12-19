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
const Stack = createNativeStackNavigator();

export default function AuthLayout() {
  const { user } = useUser();
  const pathName = usePathname();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  // Guard: If the user is not signed in, show the auth flow
  if (!isSignedIn) {
    return (
      <Stack.Navigator>
        <Stack.Screen name="index" component={Index} />
      </Stack.Navigator>
    );
  }

  // Extract onboarding flags from user metadata
  const hasChosenGender = user?.unsafeMetadata?.gender_chosen;
  const hasChosenAge = user?.unsafeMetadata?.chosen_age;
  const hasChosenImprovement = user?.unsafeMetadata?.chosen_improvement;
  const hasChosenHair = user?.unsafeMetadata?.chosen_hair;
  const hasChosenHistory = user?.unsafeMetadata?.chosen_history;
  const hasChosenNature = user?.unsafeMetadata?.chosen_nature;
  const hasChosenNotification = user?.unsafeMetadata?.chosen_notifications;

  const hasCompletedReferral = user?.unsafeMetadata?.referral_complete;
  const onboardingCompleted = user?.unsafeMetadata?.onboarding_completed;

  // Step 1: Redirect to "choose-gender" if gender is not chosen
  if (!hasChosenGender && pathName !== '/auth/choose-gender') {
    router.push('/auth/choose-gender');
  }

  // Step 2: Redirect to "referral" if gender is chosen but referral is incomplete
  if (
    hasChosenGender &&
    !hasCompletedReferral &&
    pathName !== '/auth/referral'
  ) {
    router.push('/auth/referral');
  }

  if (
    hasChosenGender &&
    hasCompletedReferral &&
    !hasChosenAge &&
    pathName !== '/auth/age'
  ) {
    router.push('/auth/age');
  }

  if (
    hasChosenGender &&
    hasCompletedReferral &&
    hasChosenAge &&
    !hasChosenImprovement &&
    pathName !== '/auth/improvement'
  ) {
    return <Redirect href="/auth/improvement" />;
  }
  if (
    hasChosenGender &&
    hasCompletedReferral &&
    hasChosenAge &&
    hasChosenImprovement &&
    !hasChosenHair &&
    pathName !== '/auth/wash-hair'
  ) {
    return <Redirect href="/auth/wash-hair" />;
  }

  if (
    hasChosenGender &&
    hasCompletedReferral &&
    hasChosenAge &&
    hasChosenImprovement &&
    hasChosenHair &&
    !hasChosenHistory &&
    pathName !== '/auth/hair-loss'
  ) {
    return <Redirect href="/auth/hair-loss" />;
  }

  if (
    hasChosenGender &&
    hasCompletedReferral &&
    hasChosenAge &&
    hasChosenImprovement &&
    hasChosenHair &&
    hasChosenHistory &&
    !hasChosenNature &&
    pathName !== '/auth/nature'
  ) {
    return <Redirect href="/auth/nature" />;
  }

  if (
    hasChosenGender &&
    hasCompletedReferral &&
    hasChosenAge &&
    hasChosenImprovement &&
    hasChosenHair &&
    hasChosenHistory &&
    hasChosenNature &&
    !hasChosenNotification &&
    pathName !== '/auth/notification'
  ) {
    return <Redirect href="/auth/notification" />;
  }

  // Step 3: Redirect to home if onboarding is completed
  if (onboardingCompleted) {
    return <Redirect href="/(tabs)" />;
  }

  // Default Stack for Onboarding Screens
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
        component={Index}
      />
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
    </Stack.Navigator>
  );
}
