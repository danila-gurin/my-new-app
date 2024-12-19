import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Animated } from 'react-native';

type Step = {
  label: string;
  completed: boolean;
};

const ProgressLineWithCircles = ({ currentStep = 0 }) => {
  // Define the steps in the user's sign-up process
  const steps: Step[] = [
    { label: '', completed: currentStep >= 1 },
    { label: '', completed: currentStep >= 2 },
    { label: '', completed: currentStep >= 3 },
    { label: '', completed: currentStep >= 4 },
    { label: '', completed: currentStep >= 5 },
    { label: '', completed: currentStep >= 6 },
    { label: '', completed: currentStep >= 7 },
    { label: '', completed: currentStep >= 8 },
    { label: '', completed: currentStep >= 9 },
  ];

  // Adjust the progress to push the filled line back by one step
  const progress = (currentStep - 1) / (steps.length - 1); // Shift the progress by 1 step

  const [animatedProgress] = useState(new Animated.Value(progress));

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false, // React Native's animated transitions
    }).start();
  }, [progress, animatedProgress]);

  return (
    <View style={styles.container}>
      {/* Progress Line Container */}
      <View style={styles.progressContainer}>
        {/* Unfilled Background Line */}
        <View style={styles.unfilledLine} />

        {/* Animated Filled Line */}
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: animatedProgress.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'], // Smoothly transition from 0 to 100%
              }),
            },
          ]}
        />

        {/* Circles */}
        <View style={styles.circlesContainer}>
          {steps.map((step, index) => (
            <View key={index} style={styles.circleContainer}>
              {/* Circle */}
              <View
                style={[
                  styles.circle,
                  step.completed && styles.circleCompleted,
                ]}
              />
              {/* Step Label */}
              <Text style={styles.stepLabel}>{step.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default ProgressLineWithCircles;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    width: '80%',
    left: 20,
    position: 'relative',
  },
  // Unfilled Line Style
  unfilledLine: {
    height: 4,
    top: 15,
    backgroundColor: '#636161',
    borderRadius: 4,
  },
  // Progress Bar Style
  progressBar: {
    position: 'absolute',
    top: 15, // Align with the unfilled line
    left: 0,
    height: 4,
    backgroundColor: '#4485ff',
    borderRadius: 4,
  },
  circlesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 18,
    height: 18,
    top: 4,
    borderRadius: 12,
    backgroundColor: '#636161',
    borderWidth: 2,
    borderColor: '#636161',
  },
  circleCompleted: {
    backgroundColor: '#4485ff',
    borderColor: '#4485ff',
  },
  stepLabel: {
    marginTop: 6,
    fontSize: 12,
    color: 'gray',
    textAlign: 'center',
  },
});
