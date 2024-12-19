import { SignedIn, useClerk } from '@clerk/clerk-expo';
import { Button, StyleSheet, Text, View } from 'react-native';

const SettingsScreen = () => {
  const { signOut, user } = useClerk();

  return (
    <View style={styles.container}>
      <SignedIn>
        <Text style={styles.text}>
          Email: {user?.emailAddresses[0]?.emailAddress}
        </Text>
        <Text style={styles.text}>Full Name: {user?.fullName}</Text>
        <Text style={styles.text}>username: {user?.username || 'N/A'}</Text>
        <Button title="Logout" onPress={() => signOut()} />
      </SignedIn>
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
  },
});
