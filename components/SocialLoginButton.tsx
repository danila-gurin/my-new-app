import { useAuth, useOAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Linking from 'expo-linking';
import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

const SocialLoginButton = ({
  strategy,
}: {
  strategy: 'facebook' | 'google' | 'apple';
}) => {
  const getStrategy = () => {
    if (strategy === 'facebook') {
      return 'oauth_facebook';
    } else if (strategy === 'google') {
      return 'oauth_google';
    } else if (strategy === 'apple') {
      return 'oauth_apple';
    }
    return 'oauth_facebook';
  };

  const { startOAuthFlow } = useOAuth({ strategy: getStrategy() });
  const [isLoading, setIsLoading] = useState(false);
  const { isSignedIn } = useUser(); // Destructure isSignedIn here
  const { user } = useUser();
  const router = useRouter();
  const buttonText = () => {
    if (isLoading) {
      return 'Loading...';
    }

    if (strategy === 'facebook') {
      return 'Continue with Facebook';
    } else if (strategy === 'google') {
      return 'Continue with Google';
    } else if (strategy === 'apple') {
      return 'Continue with Apple';
    }
  };

  const buttonIcon = () => {
    if (strategy === 'facebook') {
      return <Ionicons name="logo-facebook" size={24} color="#1977F3" />;
    } else if (strategy === 'google') {
      return <Ionicons name="logo-google" size={24} color="#DB4437" />;
    } else if (strategy === 'apple') {
      return <Ionicons name="logo-apple" size={24} color="white" />;
    }
  };

  async function getTempId() {
    try {
      let tempId = await AsyncStorage.getItem('tempId');
      if (!tempId) {
        tempId = uuidv4(); // Generate a new UUID
        await AsyncStorage.setItem('tempId', tempId as string);
      }
      return tempId;
    } catch (error) {
      console.error('Error with AsyncStorage:', error);
      throw error;
    }
  }

  const onSocialLoginPress = React.useCallback(async () => {
    if (isSignedIn) {
      // User is already signed in, so redirect to the dashboard or another page
      return router.push('/(tabs)');
    }
    const tempId = await getTempId();
    try {
      async function addDocument() {
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
                userId: user?.id,
                email: user?.emailAddresses[0].emailAddress, // Merge referral data
              },
              { merge: true } // Ensure the update doesn't overwrite existing data
            );
          } else {
            // Create a new document if none exists
            await addDoc(collection(db, 'users'), {
              tempId: tempId,
              userId: user?.id,
              email: user?.emailAddresses[0].emailAddress,
            });
          }
        } catch (e) {
          console.error('Error adding document: ', e);
        }
      }

      const currentState = await AsyncStorage.getItem('onboardingState');
      const newState = {
        ...(currentState ? JSON.parse(currentState) : {}),
        signed_in: true,
      };
      await AsyncStorage.setItem('onboardingState', JSON.stringify(newState));
      // console.log(newState.signed_in);
      setIsLoading(true);
      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl: Linking.createURL('/dashboard', { scheme: 'myapp' }),
      });

      // If sign in was successful, set the active session
      if (createdSessionId) {
        console.log('Session created', createdSessionId);
        setActive!({ session: createdSessionId });
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (user?.id && user?.emailAddresses[0]?.emailAddress) {
          await addDocument();
        } else {
          console.log('User data not yet available');
        }

        // Introduce a delay before redirecting
        setTimeout(() => {
          router.push('/(tabs)');
        }, 1000); // 1 second delay
      } else {
        // Use signIn or signUp returned from startOAuthFlow
        // for next steps, such as MFA
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <TouchableOpacity
      style={[styles.container]}
      onPress={onSocialLoginPress}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="black" />
      ) : (
        buttonIcon()
      )}
      <Text style={styles.buttonText}>{buttonText()}</Text>
      <View />
    </TouchableOpacity>
  );
};

export default SocialLoginButton;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderColor: 'gray',
    borderWidth: StyleSheet.hairlineWidth,
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',

    gap: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'medium',
  },
});
function uuidv4(): string | null {
  throw new Error('Function not implemented.');
}
