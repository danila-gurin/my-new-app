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
import { Ionicons } from '@expo/vector-icons';

const ImprovementScreen = () => {
  const { user, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  // Change selected options state to an array
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
    const improvementChoices = selectedOption; // Use the selected options state for improvement choices
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
              improvementChoices: improvementChoices, // Merge referral data
            },
            { merge: true } // Ensure the update doesn't overwrite existing data
          );
        } else {
          // Create a new document if none exists
          await addDoc(collection(db, 'users'), {
            tempId: tempId,
            improvementChoices: improvementChoices,
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
        improvement_chosen: true,
      };
      await AsyncStorage.setItem('onboardingState', JSON.stringify(newState));

      // Navigate to main app
      router.push('/auth/wash-hair');
    } catch (error: any) {
      console.error('Error updating user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for selecting an option
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
          {/* <TouchableOpacity
            style={styles.goBackButton}
            onPress={async () => {
              try {
                // Update user's metadata
                const currentState = await AsyncStorage.getItem(
                  'onboardingState'
                );
                const newState = {
                  ...(currentState ? JSON.parse(currentState) : {}),
                  referral_complete: false,
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
          <ProgressLineWithCircles currentStep={4} />
          <Text style={styles.label}>
            Which area do you{'\n'}seek improvement in?
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          <TouchableOpacity
            style={[
              styles.radioButton,
              {
                opacity: isLoading ? 0.7 : 1,
                backgroundColor: selectedOption.includes('style')
                  ? '#1b2948'
                  : '#141a2a',
                borderColor: selectedOption.includes('style')
                  ? '#4485ff'
                  : '#4c515d',
                shadowColor: selectedOption.includes('style')
                  ? '#4485ff'
                  : '#141a2a', // Highlight when selected
                shadowOpacity: 1, // Adjust for intensity
                shadowRadius: 8, // Spread of the glow
                shadowOffset: { width: 0, height: 0 }, // No offset for a glow
                elevation: selectedOption.includes('style') ? 10 : 0, // For Android
                height: 64,
                flexDirection: 'row', // Align text and icon horizontally
                justifyContent: 'space-between', // Keep text left, icon right
                alignItems: 'center', // Center vertically
              },
            ]}
            disabled={isLoading}
            onPress={() => handleOptionSelect('style')}
          >
            <Text style={styles.radioButtonText}>Choosing the right style</Text>
            <Ionicons
              name="checkmark-circle-outline"
              size={24}
              color={selectedOption.includes('style') ? '#4485ff' : '#A9A9A9'}
              style={{ flexShrink: 0 }} // Prevent icon from resizing
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.radioButton,
              {
                opacity: isLoading ? 0.7 : 1,
                backgroundColor: selectedOption.includes('health')
                  ? '#1b2948'
                  : '#141a2a',
                borderColor: selectedOption.includes('health')
                  ? '#4485ff'
                  : '#4c515d',
                shadowColor: selectedOption.includes('health')
                  ? '#4485ff'
                  : '#141a2a', // Highlight when selected
                shadowOpacity: 1, // Adjust for intensity
                shadowRadius: 8, // Spread of the glow
                shadowOffset: { width: 0, height: 0 }, // No offset for a glow
                elevation: selectedOption.includes('health') ? 10 : 0, // For Android

                height: 64,
                flexDirection: 'row', // Align text and icon horizontally
                justifyContent: 'space-between', // Keep text left, icon right
                alignItems: 'center', // Center vertically
              },
            ]}
            disabled={isLoading}
            onPress={() => handleOptionSelect('health')}
          >
            <Text style={styles.radioButtonText}>Achieving Hair Health</Text>
            <Ionicons
              name="checkmark-circle-outline"
              size={24}
              color={selectedOption.includes('health') ? '#4485ff' : '#A9A9A9'}
              style={{ flexShrink: 0 }} // Prevent icon from resizing
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.radioButton,
              {
                opacity: isLoading ? 0.7 : 1,
                backgroundColor: selectedOption.includes('loss')
                  ? '#1b2948'
                  : '#141a2a',
                borderColor: selectedOption.includes('loss')
                  ? '#4485ff'
                  : '#4c515d',
                shadowColor: selectedOption.includes('loss')
                  ? '#4485ff'
                  : '#141a2a', // Highlight when selected
                shadowOpacity: 1, // Adjust for intensity
                shadowRadius: 8, // Spread of the glow
                shadowOffset: { width: 0, height: 0 }, // No offset for a glow
                elevation: selectedOption.includes('loss') ? 10 : 0, // For Android

                height: 64,
                flexDirection: 'row', // Align text and icon horizontally
                justifyContent: 'space-between', // Keep text left, icon right
                alignItems: 'center', // Center vertically
              },
            ]}
            disabled={isLoading}
            onPress={() => handleOptionSelect('loss')}
          >
            <Text style={styles.radioButtonText}>Combating Hair Loss</Text>
            <Ionicons
              name="checkmark-circle-outline"
              size={24}
              color={selectedOption.includes('loss') ? '#4485ff' : '#A9A9A9'}
              style={{ flexShrink: 0 }} // Prevent icon from resizing
            />
          </TouchableOpacity>

          {/* Submit Button */}
          <View style={{ marginTop: 20 }}>
            <TouchableOpacity
              style={[styles.button, { opacity: isLoading ? 0.7 : 1 }]}
              onPress={onSubmit} // Use the updated onSubmit handler
              disabled={isLoading || selectedOption.length === 0}
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

export default ImprovementScreen;

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
    margin: 12,
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
    // marginTop: 110,
    top: 70,
    alignItems: 'center',
    gap: 20,
  },
  button: {
    padding: 20,
    borderRadius: 30,
    top: 37,
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
  goBackText: {
    color: '#3f4857',
    fontSize: 16,
    fontWeight: 'semibold',
  },
});
function uuidv4(): string | null {
  throw new Error('Function not implemented.');
}
