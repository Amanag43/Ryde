import { ScrollView, Text, View, Image} from "react-native";
import { useState } from "react";

import { images } from "@/constants/onboarding";
import { icons } from "@/constants/onboarding";
import InputField from "@/components/InputField";
import CustomButton from "@/components/CustomButton";
import OAuth from "@/components/OAuth"
import { Link } from "expo-router";
import { useSignUp } from '@clerk/clerk-expo'

const SignUp = () => {
    const { isLoaded, signUp, setActive } = useSignUp()
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [Verification, setVerification] = useState(
      state:"default",
      error:"",
      code:"",
      );

 const onSignUpPress = async () => {
    if (!isLoaded) return

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
      })

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      // Set 'pendingVerification' to true to display second form
      // and capture code
      setVerification(
          ...verification
          state:"pending"
          );
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2))
    }
  }

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: verification.code,
      })

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === 'complete') {
          //TODO create a database user
        await setActive({
          session: signUpAttempt.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              // Check for tasks and navigate to custom UI to help users resolve them
              // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
              console.log(session?.currentTask)
              return
            }

           setVerification({...verification,state:"success"});
          },
        })
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
         setVerification({...verification,error:"Verification failed",state:"failed"});      }
    } catch (err:any) {
      setVerification({...verification,error:err.errors[0].longMessage,state:"failed"});
    }
  };

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
            Create your Account
          </Text>

        </View>

        {/* Form */}
        <View className="p-5">
          <InputField
            label="Name"
            placeholder="Enter your name"
            icon={icons.person}
            value={form.name}
            onChangeText={(value) =>
              setForm({ ...form, name: value })
            }
          />
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
                        <CustomButton
                          title="Sign Up"
                          onPress={onSignUpPress}
                          bgVariant="primary"
                          textVariants="default"
                          className="mt-5 w-full"
                         />

                         <OAuth />
<Link href="/sign-in" className="mt-10">
  <Text className="text-lg text-center text-general-200 mt-10">
    Already have an account?{" "}
    <Text className="text-primary-500">Log In</Text>
  </Text>
</Link>
</View>
      </View>
    </ScrollView>
  );
};

export default SignUp;
