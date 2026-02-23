import {View, Text,Image} from "react-native";
import CustomButton from "@/components/CustomButton";
import { icons } from "@/constants/onboarding";



const OAuth =() =>{
const handleGoogleSignIn = async() => {};
return(
    <View>

<View className ="flex flex-row justify-center items-center mt-4
gap-x-3">
<View className ="flex-1 h-[1px] bg-gray-100"/>
<Text className="text-lg"> Or</Text>
<View className ="flex-1 h-[1px] bg-gray-100"/>
</View>




<CustomButton title= "Continue with Google"
bgVariant="outline"
className="mt-5 w-full bg-white border border-[#DADCE0] rounded-x1 py-3"
activeOpacity={0.85}
IconLeft ={() => (
        <Image
        source= {icons.google}
        resizeMode="contain"
        className="w-5 h-5 mr-3"
/>
)}

textVariants="primary"
onPress ={handleGoogleSignIn}
/>
</View>
);

};
export default OAuth;