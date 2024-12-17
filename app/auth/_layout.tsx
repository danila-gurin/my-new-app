import { useAuth, useUser } from '@clerk/clerk-expo';
import { Redirect, Stack, usePathname } from 'expo-router';

export default function AuthLayout() {
  const { user } = useUser();
  const pathName = usePathname();
  const { isSignedIn } = useAuth();

  // Guard: If the user is not signed in, show the auth flow
  if (!isSignedIn) {
    return (
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
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
    return <Redirect href="/auth/choose-gender" />;
  }

  // Step 2: Redirect to "referral" if gender is chosen but referral is incomplete
  if (
    hasChosenGender &&
    !hasCompletedReferral &&
    pathName !== '/auth/referral'
  ) {
    return <Redirect href="/auth/referral" />;
  }

  if (
    hasChosenGender &&
    hasCompletedReferral &&
    !hasChosenAge &&
    pathName !== '/auth/age'
  ) {
    return <Redirect href="/auth/age" />;
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
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="choose-gender" options={{ headerShown: false }} />
      <Stack.Screen name="referral" options={{ headerShown: false }} />
      <Stack.Screen name="age" options={{ headerShown: false }} />
      <Stack.Screen name="improvement" options={{ headerShown: false }} />
      <Stack.Screen name="wash-hair" options={{ headerShown: false }} />
      <Stack.Screen name="hair-loss" options={{ headerShown: false }} />
      <Stack.Screen name="nature" options={{ headerShown: false }} />
      <Stack.Screen name="notification" options={{ headerShown: false }} />
    </Stack>
  );
}
