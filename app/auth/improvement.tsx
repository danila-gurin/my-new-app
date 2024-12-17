import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { useEffect, useState } from 'react';
import ProgressLineWithCircles from '@/components/ProgressBarWithCircles';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';

const ImprovementScreen = () => {
  const { user, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  // Change selected options state to an array
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { control, handleSubmit, setValue } = useForm({
    defaultValues: {
      gender: '',
    },
  });

  // Submit Handler
  const onSubmit = async (data: any) => {
    const { gender } = data;

    try {
      setIsLoading(true);

      // Update user's metadata with selected options
      await user?.update({
        unsafeMetadata: {
          gender_chosen: true,
          referral_complete: true, // Use the updated state here
          chosen_age: true,
          chosen_improvement: true,
          chosen_hair: false,
          onboarding_completed: false,
        },
      });

      await user?.reload();

      // Navigate to main app
      router.push('/(tabs)');
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

  // Handler for selecting an option
  const handleOptionSelect = (option: string) => {
    setSelectedOptions((prevState) => {
      // Check if the option is already selected, if it is, remove it, otherwise add it
      if (prevState.includes(option)) {
        return prevState.filter((item) => item !== option); // Remove option
      } else {
        return [...prevState, option]; // Add option
      }
    });
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
                backgroundColor: selectedOptions.includes('style')
                  ? '#4485ff'
                  : '#141a2a', // Highlight when selected
              },
            ]}
            disabled={isLoading}
            onPress={() => handleOptionSelect('style')}
          >
            <Text style={styles.radioButtonText}>Choosing the right style</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.radioButton,
              {
                opacity: isLoading ? 0.7 : 1,
                backgroundColor: selectedOptions.includes('health')
                  ? '#4485ff'
                  : '#141a2a', // Highlight when selected
              },
            ]}
            disabled={isLoading}
            onPress={() => handleOptionSelect('health')}
          >
            <Text style={styles.radioButtonText}>Achieving Hair Health</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.radioButton,
              {
                opacity: isLoading ? 0.7 : 1,
                backgroundColor: selectedOptions.includes('loss')
                  ? '#4485ff'
                  : '#141a2a', // Highlight when selected
              },
            ]}
            disabled={isLoading}
            onPress={() => handleOptionSelect('loss')}
          >
            <Text style={styles.radioButtonText}>Combating Hair Loss</Text>
          </TouchableOpacity>

          {/* Submit Button */}
          <View style={{ marginTop: 20 }}>
            <TouchableOpacity
              style={[styles.button, { opacity: isLoading ? 0.7 : 1 }]}
              onPress={handleSubmit(onSubmit)}
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
    marginTop: 110,
    alignItems: 'center',
    gap: 20,
  },
  button: {
    padding: 20,
    borderRadius: 30,
    marginTop: 20,
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
