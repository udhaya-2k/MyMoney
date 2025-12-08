import { useRouter } from 'expo-router';
import { Button, Text, View } from 'react-native';

export default function Modal() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text>Add or Edit Entry</Text>
      <Button title="Close" onPress={() => router.back()} />
    </View>
  );
}
