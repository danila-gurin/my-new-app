import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import ProgressLineWithCircles from '@/components/ProgressBarWithCircles';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';

import { db } from '@/firebase';

import { v4 as uuidv4 } from 'uuid';

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

      // Create a reference to the user's document in Firestore
      async function addDocument() {
        console.log('Starting to add document...'); // Add this
        try {
          const docRef = await addDoc(collection(db, 'users'), {
            tempId: tempId,
            gender: gender,
          });
          console.log('Document written with ID: ', docRef.id);
        } catch (e) {
          console.error('Error adding document: ', e);
        }
      }

      addDocument();
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

      // Update user's metadata with gender and onboarding flag
      await user?.update({
        unsafeMetadata: {
          gender_chosen: true,
          referral_complete: false,
          onboarding_completed: false,
        },
      });

      await user?.reload();

      // Navigate to main app
      router.push('/auth/referral');
    } catch (error: any) {
      console.error('Error updating user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sync user data to form when loaded
  useEffect(() => {
    if (isLoaded && user) {
      const existingGender = String(user?.unsafeMetadata?.gender) || '';
      if (existingGender) {
        setValue('gender', existingGender);
      }
    }
  }, [isLoaded, user, setValue]);

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
        <ProgressLineWithCircles currentStep={1} />
        <Text style={styles.label}>Choose{'\n'}your gender</Text>
      </View>

      {/* Form Section */}
      <View style={styles.formContainer}>
        {/* Gender Selection Buttons */}
        <TouchableOpacity
          style={[
            styles.genderButton,
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
          style={[styles.genderButton, { opacity: isLoading ? 0.7 : 1 }]}
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
      {isLoading && (
        <ActivityIndicator
          size="large"
          color="blue"
          style={{ marginTop: 20 }}
        />
      )}
    </View>
  );
};

export default ChooseGenderScreen;

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
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
  },
  formContainer: {
    width: '100%',
    marginTop: 140,
    gap: 0,
  },
  genderButton: {
    padding: 20,
    borderRadius: 30,
    borderColor: 'white',

    alignItems: 'center',
    justifyContent: 'center',
    width: '100%', // Ensures the button spans the available width
  },
  buttonText: {
    color: 'white',
    fontWeight: 'semibold',
    fontSize: 18,
  },
});
