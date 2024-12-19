import { StyleSheet, Text, View } from 'react-native';

import { db } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';

async function addDocument() {
  // console.log('Starting to add document...'); // Add this
  try {
    const docRef = await addDoc(collection(db, ''), {});
    console.log('Document written with ID: ', docRef.id);
  } catch (e) {
    // console.error('Error adding document: ', e);
  }
}

const HomeScreen = () => {
  addDocument();
  return (
    <View style={styles.container}>
      <Text style={{ color: 'white' }}>HomeScreen</Text>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
