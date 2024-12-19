import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { useEffect, useRef, useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';

const AgeScreen = () => {
  const { user, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const [age, setAge] = useState('');
  const [invalidAge, setInvalidAge] = useState(false);

  const router = useRouter();
  const insets = useSafeAreaInsets();

  const buttonAnimation = useRef(new Animated.Value(0)).current;

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      age: '',
    },
  });

  const ageTemp = watch('age');

  const getTempId = async () => {
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
  };

  // Submit Handler
  const onSubmit = async (data: any) => {
    const { age } = data;
    if (!age || isNaN(Number(age)) || Number(age) <= 0 || Number(age) > 120) {
      console.log('invalid age');
      setInvalidAge(true);
      return;
    }
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
              age: age, // Merge referral data
            },
            { merge: true } // Ensure the update doesn't overwrite existing data
          );
        } else {
          // Create a new document if none exists
          await addDoc(collection(db, 'users'), {
            tempId: tempId,
            age: age,
          });
        }
      } catch (e) {
        console.error('Error adding document: ', e);
      }
    }

    addDocument();

    try {
      setIsLoading(true);

      await user?.update({
        unsafeMetadata: {
          gender_chosen: true,
          referral_complete: true, // Use the updated state here
          chosen_age: true,
          chosen_improvement: false,
          onboarding_completed: false,
        },
      });

      await user?.reload();
      router.push('/auth/improvement');
    } catch (error: any) {
      console.error('Error updating user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Keyboard animation handling
  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      'keyboardWillShow',
      (event) => {
        Animated.timing(buttonAnimation, {
          toValue: -event.endCoordinates.height + insets.bottom,
          duration: event.duration,
          useNativeDriver: true,
        }).start();
      }
    );

    const hideSubscription = Keyboard.addListener(
      'keyboardWillHide',
      (event) => {
        Animated.timing(buttonAnimation, {
          toValue: 0,
          duration: event.duration,
          useNativeDriver: true,
        }).start();
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.keyboardAvoidingView}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          style={[
            styles.container,
            {
              paddingTop: insets.top + 40,
              backgroundColor: '#080815',
            },
          ]}
        >
          {/* Fixed Header Section */}
          <View style={styles.headerSection}>
            <TouchableOpacity
              style={styles.goBackButton}
              onPress={async () => {
                try {
                  // Update user's metadata
                  await user?.update({
                    unsafeMetadata: {
                      referral: false,
                    },
                  });

                  // Navigate to the choose-gender screen
                  router.push('/auth/referral');
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
            <View style={styles.headingContainer}>
              <ProgressLineWithCircles currentStep={3} />
              <Text style={styles.label}>Enter your Age</Text>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                ref={inputRef}
                placeholder="Ex. 25"
                placeholderTextColor="gray"
                style={styles.input}
                value={ageTemp}
                onChangeText={(text) => setValue('age', text)}
                autoFocus={true}
                keyboardType="numeric"
              />
              <Text style={styles.description}>
                {invalidAge
                  ? 'Invalid age entered...'
                  : 'Enter the number here, then continue'}
              </Text>
            </View>
          </View>

          {/* Animated Button Section */}
          <Animated.View
            style={[
              styles.buttonContainer,
              {
                transform: [{ translateY: buttonAnimation }],
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.button, { opacity: isLoading ? 0.7 : 1 }]}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
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
                  <Text style={styles.buttonText}>Continue</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

export default AgeScreen;

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: '#080815',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  headerSection: {
    gap: 40,
  },
  headingContainer: {
    width: '100%',
    gap: 5,
  },
  inputContainer: {
    width: '100%',
    gap: 8,
  },
  input: {
    height: 65,
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
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  button: {
    padding: 20,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
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
