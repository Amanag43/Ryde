import { View, Text } from "react-native";
import { Redirect} from "expo-router";
import { Stack } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'

export default function AuthRoutesLayout() {

const Home = () => {
    const { isSignedIn } = useAuth()

      if (isSignedIn) {
        return <Redirect href= "/(root)/(tabs)/home" />
      }

      return <Stack />
    }

  return <Redirect href ="/(auth)/welcome"/>;
};
export default Home;