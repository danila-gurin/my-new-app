import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ButtonProps {
  isLoading: boolean;
  onSubmit: () => void;
}

const CustomButton: React.FC<ButtonProps> = ({ isLoading, onSubmit }) => {
  return (
    <TouchableOpacity
      style={[styles.button, { opacity: isLoading ? 0.7 : 1 }]}
      onPress={onSubmit}
      disabled={isLoading}
    >
      {isLoading ? <ActivityIndicator size="small" color="white" /> : null}
      <LinearGradient
        colors={['rgba(2,0,36,1)', 'rgba(9,9,121,1)', 'rgba(0,212,255,1)']}
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
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CustomButton;
