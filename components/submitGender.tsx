import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { db } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import PagerView from 'react-native-pager-view';
import { LinearGradient } from 'expo-linear-gradient';
import ProgressLineWithCircles from '@/components/ProgressBarWithCircles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

export const GenderPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const pagerRef = React.useRef<PagerView>(null);

  const getTempId = async () => {
    try {
      let tempId = await AsyncStorage.getItem('tempId');
      if (!tempId) {
        tempId = uuidv4();
        await AsyncStorage.setItem('tempId', tempId);
      }
      return tempId;
    } catch (error) {
      console.error('Error with AsyncStorage:', error);
      return null;
    }
  };

  const handleGenderSubmit = async (gender: any) => {
    const tempId = await getTempId();
    if (!tempId) {
      console.error('Error: tempId is null');
      return;
    }

    try {
      setIsLoading(true);
      const userDocRef = doc(db, 'users', tempId);
      const existingDoc = await getDoc(userDocRef);

      if (existingDoc.exists()) {
        await setDoc(
          userDocRef,
          {
            gender,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } else {
        await setDoc(userDocRef, {
          tempId,
          gender,
          createdAt: new Date().toISOString(),
        });
      }

      const currentState = await AsyncStorage.getItem('onboardingState');
      const newState = {
        ...(currentState ? JSON.parse(currentState) : {}),
        gender_chosen: true,
      };
      await AsyncStorage.setItem('onboardingState', JSON.stringify(newState));

      if (pagerRef.current) pagerRef.current.setPage(2);
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.pageContainer,
        {
          paddingTop: insets.top + 40,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <View style={styles.headingContainer}>
        <ProgressLineWithCircles currentStep={1} />
        <Text style={styles.label}>Choose{'\n'}your gender</Text>
      </View>

      <View style={styles.formContainer}>
        <TouchableOpacity
          style={{ opacity: isLoading ? 0.7 : 1 }}
          onPress={() => handleGenderSubmit('male')}
          disabled={isLoading}
        >
          <LinearGradient
            colors={['rgba(2,0,36,1)', 'rgba(9,9,121,1)', 'rgba(0,212,255,1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.genderButton}
          >
            <Text style={styles.buttonText}>Male</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ opacity: isLoading ? 0.7 : 1 }}
          onPress={() => handleGenderSubmit('female')}
          disabled={isLoading}
        >
          <LinearGradient
            colors={['rgba(2,0,36,1)', 'rgba(9,9,121,1)', 'rgba(0,212,255,1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.genderButton}
          >
            <Text style={styles.buttonText}>Female</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080815',
  },
  pagerView: {
    flex: 1,
    width: '100%',
  },
  pageContainer: {
    flex: 1,
    padding: 20,
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
    borderWidth: 1,
    borderTopColor: '#4485ff',
    borderLeftColor: '#4485ff',
    borderRightColor: '#4485ff',
    borderBottomColor: '#97cbf7',
    alignSelf: 'center',
    alignItems: 'center',
    width: 325,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'semibold',
    fontSize: 18,
  },
});
