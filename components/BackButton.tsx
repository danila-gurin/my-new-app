// components/BackButton.tsx
import { Button } from '@react-navigation/elements';
import { useNavigation } from '@react-navigation/native';

const BackButton = ({ onPress }: { onPress: () => void }) => {
  return <Button onPress={onPress}>back</Button>;
};

export default BackButton;
