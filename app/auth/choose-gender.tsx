import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { Redirect, useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import ProgressLineWithCircles from '@/components/ProgressBarWithCircles';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';

import { db } from '@/firebase';

import { v4 as uuidv4 } from 'uuid';
import { Ionicons } from '@expo/vector-icons';

const ChooseGenderScreen = () => {
  const { user, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  async function getTempId() {
    try {
      let tempId = await AsyncStorage.getItem('tempId');
      if (!tempId) {
        tempId = uuidv4(); // Generate a new UUID
        await AsyncStorage.setItem('tempId', tempId);
      }
      return tempId;
    } catch (error) {
      console.error('Error with AsyncStorage:', error);
      throw error;
    }
  }

  const { control, handleSubmit, setValue, getValues } = useForm({
    defaultValues: {
      gender: '',
    },
  });

  // Submit Handler
  const onSubmit = async (gender: string) => {
    const tempId = await getTempId();

    try {
      setIsLoading(true);

      // Reference to the user's document in Firestore
      const userDocRef = doc(db, 'users', tempId);

      // Check if the document already exists
      const existingDoc = await getDoc(userDocRef);

      if (existingDoc.exists()) {
        // Update the existing document
        console.log('Document already exists. Updating...');
        await setDoc(
          userDocRef,
          {
            gender: gender,
            updatedAt: new Date().toISOString(),
          },
          { merge: true } // Merge to preserve existing fields
        );
        console.log('Document updated.');
      } else {
        // Create a new document
        console.log('Document does not exist. Creating...');
        await setDoc(userDocRef, {
          tempId: tempId,
          gender: gender,
          createdAt: new Date().toISOString(),
        });
        console.log('Document created.');
      }

      // const userDocRef = doc(db, 'users', user?.id || '');

      // // Store the gender choice in Firestore
      // await setDoc(
      //   userDocRef,
      //   {
      //     gender,
      //     updatedAt: new Date().toISOString(),
      //     userId: user?.id,
      //     email: user?.emailAddresses[0]?.emailAddress,
      //   },
      //   { merge: true }
      // ); // Using merge to preserve other fields

      // await user?.update({
      //   unsafeMetadata: {
      //     gender_chosen: true,
      //     referral_complete: false,
      //     onboarding_completed: false,
      //   },
      // });

      // await user?.reload();

      // Update local onboarding state
      // await AsyncStorage.clear();
      const currentState = await AsyncStorage.getItem('onboardingState');

      const newState = {
        ...(currentState ? JSON.parse(currentState) : {}),
        gender_chosen: true,
      };
      await AsyncStorage.setItem('onboardingState', JSON.stringify(newState));

      // Navigate to main app
      router.push('/auth/referral');
    } catch (error: any) {
      console.error('Error updating user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sync user data to form when loaded
  // useEffect(() => {
  //   if (isLoaded && user) {
  //     const existingGender = String(user?.unsafeMetadata?.gender) || '';
  //     if (existingGender) {
  //       setValue('gender', existingGender);
  //     }
  //   }
  // }, [isLoaded, user, setValue]);

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
      {/* Heading Section */}
      <View style={styles.headingContainer}>
        {/* <TouchableOpacity
          style={styles.goBackButton}
          disabled={true}
          onPress={async () => {
            try {
              const currentState = await AsyncStorage.getItem(
                'onboardingState'
              );
              // Update user's metadata
              const newState = {
                ...(currentState ? JSON.parse(currentState) : {}),
                hair_chosen: false,
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
        </TouchableOpacity> */}
        <ProgressLineWithCircles currentStep={1} />
        <Text style={styles.label}>Choose{'\n'}your gender</Text>
      </View>

      {/* Form Section */}
      <View style={styles.formContainer}>
        {/* Gender Selection Buttons */}
        <TouchableOpacity
          style={[
            // styles.genderButton,
            {
              opacity: isLoading ? 0.7 : 1,
            },
          ]}
          onPress={() => onSubmit('male')}
          disabled={isLoading}
        >
          <LinearGradient
            colors={['rgba(2,0,36,1)', 'rgba(9,9,121,1)', 'rgba(0,212,255,1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.genderButton,
              {
                borderWidth: 1,
                borderTopColor: '#4485ff',
                borderLeftColor: '#4485ff',
                borderRightColor: '#4485ff',
                borderBottomColor: '#97cbf7',
              },
            ]}
          >
            <Text style={styles.buttonText}>Male</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            // styles.genderButton,
            { opacity: isLoading ? 0.7 : 1 },
          ]}
          onPress={() => onSubmit('female')}
          disabled={isLoading}
        >
          <LinearGradient
            colors={['rgba(2,0,36,1)', 'rgba(9,9,121,1)', 'rgba(0,212,255,1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.genderButton,
              {
                borderWidth: 1,
                borderTopColor: '#4485ff',
                borderLeftColor: '#4485ff',
                borderRightColor: '#4485ff',
                borderBottomColor: '#97cbf7',
              },
            ]}
          >
            <Text style={styles.buttonText}>Female</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Loading Indicator */}
      {/* {isLoading && (
        <ActivityIndicator
          size="large"
          color="blue"
          style={{ marginTop: 20 }}
        />
      )} */}
    </View>
  );
};

export default ChooseGenderScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    // gap: 20,
  },
  headingContainer: {
    width: '100%',
    gap: 5,
  },
  label: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
  },
  formContainer: {
    width: '100%',
    marginTop: 140,
    gap: 30,
  },
  genderButton: {
    padding: 20,
    borderRadius: 30,
    borderColor: 'white',
    alignSelf: 'center',
    alignItems: 'center',
    width: 325, // Ensures the button spans the available width
  },
  buttonText: {
    color: 'white',
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
