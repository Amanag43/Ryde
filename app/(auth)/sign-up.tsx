import { ScrollView, Text, View, Image} from "react-native";
import { useState } from "react";
import { images } from "@/constants/onboarding";
import { icons } from "@/constants/onboarding";
import InputField from "@/components/InputField";
import CustomButton from "@/components/CustomButton";
import OAuth from "@/components/OAuth"
import { Link, useRouter } from "expo-router";
import { useSignUp } from '@clerk/clerk-expo'
import { fetchAPI } from "@/lib/fetch"; // ✅ Add this
import ReactNativeModal from "react-native-modal";

const SignUp = () => {
    const { isLoaded, signUp, setActive } = useSignUp()
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const router = useRouter()
  const [Verification, setVerification] = useState({
      state: "default",
      error: "",
      code: "",
      });

 const onSignUpPress = async () => {
    if (!isLoaded) return

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
      })

      // Send user an email with Verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      // Set 'pendingVerification' to true to display second form
      // and capture code
      setVerification({
          ...Verification,
          state:"pending",
          });
    } catch (err: any) {
      Alert.alert("Error", err.errors[0].longMessage);
    }
  }

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: Verification.code,
      })

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === 'complete') {
          //TODO create a database user

          await fetchAPI('/(api)/user',
          { method: "POST",
              body: JSON.stringify({
                  name: form.name,
                  email: form.email,
                  clerkId: signUpAttempt.createdUserId,
                  }),
              });
        await setActive({
          session: signUpAttempt.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              // Check for tasks and navigate to custom UI to help users resolve them
              // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
              console.log(session?.currentTask)
              return
            }

           setVerification({...Verification,state:"success"});
          },
        })
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
         setVerification({...Verification,error:"Verification failed",state:"failed"});      }
    } catch (err:any) {
      setVerification({...Verification,error:err.errors[0].longMessage,state:"failed"});
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
<ReactNativeModal
isVisible ={Verification.state == 'pending'}
onModalHide={() =>
    setVerification({...Verification, state: "success"})}>

<View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
<Text  className="text-3xl font-JakartaBold mb-2">
Verification
</Text>
<Text className="font-Jakarta mb-5">
 We've sent a verification code to {form.email}
</Text>
<InputField label="Code" icon={icons.lock} placeholder="12345"
value={Verification.code} keyboardType="numeric" onChangeText={(code)=> setVerification({...Verification,code})
}
/>

{Verification.error &&(
    <Text className ="text-red-500 text-sm mt-1">
    {Verification.error}
    </Text>)}
    <CustomButton
    title="Verify Email"
    onPress={onVerifyPress}
    className="mt-5 bg-success-500"
    />
</View>
</ReactNativeModal>

{/*Verification modal*/}
<ReactNativeModal isVisible ={Verification.state == 'success'}>
<View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
<Image source ={images.check} className="w-[110px] h-[110px] mx-auto my-5"
/>

<Text  className="text-3xl font-JakartaBold text-center">
Verified
</Text>
<Text className="text-base text-gray-400 font-Jakarta text-center
mt-2"> You have successfully verified your account.
</Text>
<CustomButton title="Browse Home"
onPress={() => router.replace
    ("/(root)/(tabs)/home")}
    className="mt-5"
/>
</View>
</ReactNativeModal>
      </View>
    </ScrollView>
  );
};

export default SignUp;
