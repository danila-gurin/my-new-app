import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Keyboard,
  TouchableWithoutFeedback,
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

const NatureScreen = () => {
  const { user, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  // State for selected option
  const [selectedOption, setSelectedOption] = useState<string>('');

  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { control, handleSubmit, setValue } = useForm({
    defaultValues: {
      scalpNature: '',
    },
  });

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
  const onSubmit = async (data: any) => {
    const { scalpNature } = data;
    const tempId = await getTempId();

    async function addDocument() {
      console.log('Starting to add document...');
      try {
        const userQuery = query(
          collection(db, 'users'),
          where('tempId', '==', tempId)
        );
        const querySnapshot = await getDocs(userQuery);
        if (!querySnapshot.empty) {
          // Update the existing document
          const docId = querySnapshot.docs[0].id;
          const userRef = doc(db, 'users', docId);

          await setDoc(
            userRef,
            {
              scalpNature: selectedOption, // Store the selected option
            },
            { merge: true }
          );
        } else {
          // Create a new document if none exists
          await addDoc(collection(db, 'users'), {
            tempId: tempId,
            scalpNature: selectedOption,
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
      const currentState = await AsyncStorage.getItem('onboardingState');
      const newState = {
        ...(currentState ? JSON.parse(currentState) : {}),
        nature_chosen: true,
      };
      await AsyncStorage.setItem('onboardingState', JSON.stringify(newState));

      // Navigate to main app
      router.push('/auth/notification');
    } catch (error: any) {
      console.error('Error updating user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for selecting an option (only allows one option)
  const handleOptionSelect = (option: string) => {
    setSelectedOption(option); // Update state with the selected option
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
          {/* <TouchableOpacity
            style={styles.goBackButton}
            onPress={async () => {
              try {
                const currentState = await AsyncStorage.getItem(
                  'onboardingState'
                );
                // Update user's metadata
                const newState = {
                  ...(currentState ? JSON.parse(currentState) : {}),
                  history_chosen: false,
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
          <ProgressLineWithCircles currentStep={7} />
          <Text style={styles.label}>Pick your{'\n'}scalp's nature</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          <TouchableOpacity
            style={[
              styles.radioButton,
              {
                opacity: isLoading ? 0.7 : 1,
                backgroundColor:
                  selectedOption === 'Dry' ? '#1b2948' : '#141a2a',
                borderColor: selectedOption === 'Dry' ? '#4485ff' : '#4c515d',
                shadowColor: selectedOption === 'Dry' ? '#4485ff' : '#141a2a', // Highlight when selected
                shadowOpacity: 1, // Adjust for intensity
                shadowRadius: 8, // Spread of the glow
                shadowOffset: { width: 0, height: 0 }, // No offset for a glow
                elevation: selectedOption === 'Dry' ? 10 : 0, // For Android
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: 64,
                paddingHorizontal: 20,
              },
            ]}
            disabled={isLoading}
            onPress={() => handleOptionSelect('Dry')}
          >
            <Text style={styles.radioButtonText}>Dry</Text>
            <Ionicons
              name="checkmark-circle-outline"
              size={24}
              color={selectedOption === 'Dry' ? '#4485ff' : '#A9A9A9'}
              style={{ flexShrink: 0 }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.radioButton,
              {
                opacity: isLoading ? 0.7 : 1,
                backgroundColor:
                  selectedOption === 'Normal' ? '#1b2948' : '#141a2a',
                borderColor:
                  selectedOption === 'Normal' ? '#4485ff' : '#4c515d',
                shadowColor:
                  selectedOption === 'Normal' ? '#4485ff' : '#141a2a', // Highlight when selected
                shadowOpacity: 1, // Adjust for intensity
                shadowRadius: 8, // Spread of the glow
                shadowOffset: { width: 0, height: 0 }, // No offset for a glow
                elevation: selectedOption === 'Normal' ? 10 : 0, // For Android
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: 64,
                paddingHorizontal: 20,
              },
            ]}
            disabled={isLoading}
            onPress={() => handleOptionSelect('Normal')}
          >
            <Text style={styles.radioButtonText}>Normal</Text>

            <Ionicons
              name="checkmark-circle-outline"
              size={24}
              color={selectedOption === 'Normal' ? '#4485ff' : '#A9A9A9'}
              style={{ flexShrink: 0 }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.radioButton,
              {
                opacity: isLoading ? 0.7 : 1,
                backgroundColor:
                  selectedOption === 'oily' ? '#1b2948' : '#141a2a',
                borderColor: selectedOption === 'oily' ? '#4485ff' : '#4c515d',
                shadowColor: selectedOption === 'oily' ? '#4485ff' : '#141a2a', // Highlight when selected
                shadowOpacity: 1, // Adjust for intensity
                shadowRadius: 8, // Spread of the glow
                shadowOffset: { width: 0, height: 0 }, // No offset for a glow
                elevation: selectedOption === 'oily' ? 10 : 0, // For Android
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: 64,
                paddingHorizontal: 20,
              },
            ]}
            disabled={isLoading}
            onPress={() => handleOptionSelect('oily')}
          >
            <Text style={styles.radioButtonText}>Oily</Text>
            <Ionicons
              name="checkmark-circle-outline"
              size={24}
              color={selectedOption === 'oily' ? '#4485ff' : '#A9A9A9'}
              style={{ flexShrink: 0 }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.radioButton,
              {
                opacity: isLoading ? 0.7 : 1,
                backgroundColor:
                  selectedOption === 'undetermined' ? '#1b2948' : '#141a2a',
                borderColor:
                  selectedOption === 'undetermined' ? '#4485ff' : '#4c515d',
                shadowColor:
                  selectedOption === 'undetermined' ? '#4485ff' : '#141a2a', // Highlight when selected
                shadowOpacity: 1, // Adjust for intensity
                shadowRadius: 8, // Spread of the glow
                shadowOffset: { width: 0, height: 0 }, // No offset for a glow
                elevation: selectedOption === 'undetermined' ? 10 : 0, // For Android
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: 64,
                paddingHorizontal: 20,
              },
            ]}
            disabled={isLoading}
            onPress={() => handleOptionSelect('undetermined')}
          >
            <Text style={styles.radioButtonText}>Undetermined</Text>
            <Ionicons
              name="checkmark-circle-outline"
              size={24}
              color={selectedOption === 'undetermined' ? '#4485ff' : '#A9A9A9'}
              style={{ flexShrink: 0 }}
            />
          </TouchableOpacity>
          {/* Submit Button */}
          <View style={{ marginTop: 20 }}>
            <TouchableOpacity
              style={[styles.button, { opacity: isLoading ? 0.7 : 1 }]}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading || !selectedOption}
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
      </View>
    </TouchableWithoutFeedback>
  );
};

export default NatureScreen;

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
    top: 70,
    alignItems: 'center',
    gap: 20,
  },
  button: {
    padding: 20,
    borderRadius: 30,
    marginTop: 7,
    bottom: 13,
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
function uuidv4(): string | null {
  throw new Error('Function not implemented.');
}
