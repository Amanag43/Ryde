import { ScrollView, Text, View, Image} from "react-native";
import { useState } from "react";

import { images } from "@/constants/onboarding";
import { icons } from "@/constants/onboarding";
import InputField from "@/components/InputField";
import CustomButton from "@/components/CustomButton";
import OAuth from "@/components/OAuth"
import { Link } from "expo-router";

const SignIn = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

const onSignInPress = async() => {};
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        {/* Header Image */}
        <View>
          <Image
            source={images.signUpCar}
            className="z-0 w-full h-[250px]"
          />
          <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
            Welcome,back
          </Text>
        </View>

        {/* Form */}
        <View className="p-5">

                      <InputField
                      label="Email"
                      placeholder="Enter your Email"
                      icon={icons.email}
                      value={form.email}
                      onChangeText={(value) =>
                        setForm({ ...form, email: value })
                      }
                    />
                        <InputField
                                label="Password"
                                placeholder="Enter your password"
                                icon={icons.lock}
                                secureTextEntry={true}
                                value={form.password}
                                onChangeText={(value) =>
                                  setForm({ ...form, password: value })
                                }
                              />
                        <CustomButton title="SignIn" onPress ={onSignInPress}
                            className="mt-6"/>
                         <OAuth />
<Link href="/sign-up" className="mt-10">
  <Text className="text-lg text-center text-general-200 mt-10">
    Don't have an account?{" "}
    <Text className="text-primary-500">SignUp</Text>
  </Text>
</Link>
</View>
      </View>
    </ScrollView>
  );
};

export default SignIn;
