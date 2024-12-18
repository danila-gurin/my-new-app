import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { useState } from 'react';
import ProgressLineWithCircles from '@/components/ProgressBarWithCircles';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
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

const WashScreen = () => {
  const { user, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  // Change selected options state to a single string
  const [selectedOption, setSelectedOption] = useState<string>('');

  const router = useRouter();
  const insets = useSafeAreaInsets();

  async function getTempId() {
    try {
      let tempId = await AsyncStorage.getItem('tempId');
      if (!tempId) {
        tempId = uuidv4(); // Generate a new UUID
        await AsyncStorage.setItem('tempId', tempId || '');
      }
      return tempId;
    } catch (error) {
      console.error('Error with AsyncStorage:', error);
      throw error;
    }
  }

  // Submit Handler
  const onSubmit = async () => {
    const frequencyOfWashing = selectedOption; // Use selectedOption directly
    const tempId = await getTempId();

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
              frequencyOfWashing: frequencyOfWashing, // Merge referral data
            },
            { merge: true } // Ensure the update doesn't overwrite existing data
          );
        } else {
          // Create a new document if none exists
          await addDoc(collection(db, 'users'), {
            tempId: tempId,
            frequencyOfWashing: frequencyOfWashing,
          });
        }
      } catch (e) {
        console.error('Error adding document: ', e);
      }
    }

    addDocument();

    try {
      setIsLoading(true);

      // Update user's metadata with selected options
      await user?.update({
        unsafeMetadata: {
          gender_chosen: true,
          referral_complete: true, // Use the updated state here
          chosen_age: true,
          chosen_improvement: true,
          chosen_hair: true,
          chosen_history: false,
          onboarding_completed: false,
        },
      });

      await user?.reload();

      // Navigate to main app
      router.push('/auth/hair-loss');
    } catch (error: any) {
      console.error('Error updating user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for selecting an option (only allows one option)
  const handleOptionSelect = (option: string) => {
    setSelectedOption(option); // Set the selected option to only one value
  };

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
          <ProgressLineWithCircles currentStep={5} />
          <Text style={styles.label}>
            How frequently do you{'\n'}wash your hair?
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          <TouchableOpacity
            style={[
              styles.radioButton,
              {
                opacity: isLoading ? 0.7 : 1,
                backgroundColor:
                  selectedOption === 'every day' ? '#4485ff' : '#141a2a', // Highlight when selected
              },
            ]}
            disabled={isLoading}
            onPress={() => handleOptionSelect('every day')}
          >
            <Text style={styles.radioButtonText}>Every Day</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.radioButton,
              {
                opacity: isLoading ? 0.7 : 1,
                backgroundColor:
                  selectedOption === 'every other day' ? '#4485ff' : '#141a2a', // Highlight when selected
              },
            ]}
            disabled={isLoading}
            onPress={() => handleOptionSelect('every other day')}
          >
            <Text style={styles.radioButtonText}>Every Other Day</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.radioButton,
              {
                opacity: isLoading ? 0.7 : 1,
                backgroundColor:
                  selectedOption === '2-3 times a week' ? '#4485ff' : '#141a2a', // Highlight when selected
              },
            ]}
            disabled={isLoading}
            onPress={() => handleOptionSelect('2-3 times a week')}
          >
            <Text style={styles.radioButtonText}>2-3 Times a Week</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.radioButton,
              {
                opacity: isLoading ? 0.7 : 1,
                backgroundColor:
                  selectedOption === 'once a week' ? '#4485ff' : '#141a2a', // Highlight when selected
              },
            ]}
            disabled={isLoading}
            onPress={() => handleOptionSelect('once a week')}
          >
            <Text style={styles.radioButtonText}>Once a Week</Text>
          </TouchableOpacity>

          {/* Submit Button */}
          <View style={{ marginTop: 20 }}>
            <TouchableOpacity
              style={[styles.button, { opacity: isLoading ? 0.7 : 1 }]}
              onPress={onSubmit} // Call onSubmit directly
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
      </View>
    </TouchableWithoutFeedback>
  );
};

export default WashScreen;

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
  input: {
    height: 65,
    margin: 10,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    color: 'white',
    backgroundColor: '#141a2a',
  },
  label: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 11,
    color: 'white',
    alignSelf: 'center',
  },
  formContainer: {
    width: '100%',
    marginTop: 90,
    alignItems: 'center',
    gap: 20,
  },
  button: {
    padding: 20,
    borderRadius: 30,
    marginTop: 5,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    width: 325,
  },
  radioButton: {
    padding: 20,
    borderRadius: 15,
    borderColor: '#4c515d',
    borderWidth: 1,
    backgroundColor: '#141a2a',
    justifyContent: 'center',
    width: 325,
  },
  radioButtonText: {
    color: 'white',
    fontWeight: 'semibold',
    fontSize: 18,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'semibold',
    fontSize: 18,
  },
});
function uuidv4(): string | null {
  throw new Error('Function not implemented.');
}
