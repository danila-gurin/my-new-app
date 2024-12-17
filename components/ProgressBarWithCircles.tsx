import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import * as Progress from 'react-native-progress';

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
  ];

  const progress = (currentStep - 1) / (steps.length - 1); // Normalized progress (0 to 1)

  return (
    <View style={styles.container}>
      {/* Progress Line */}
      <View style={styles.progressContainer}>
        <Progress.Bar
          progress={progress}
          width={null}
          height={4}
          borderRadius={4}
          borderWidth={0}
          color="#4485ff"
          unfilledColor="#636161"
          style={styles.progressBar}
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
    width: '100%',
    position: 'relative',
  },
  progressBar: {
    position: 'absolute',
    top: 12, // Align with the center of circles
    left: 0,
    right: 0,
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
