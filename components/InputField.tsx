import{
    KeyboardAvoidingView,
    Text,
    TouchableWithoutFeedback,
    View,
    Image,
    TextInput,
    Platform,
    Keyboard,
    } from "react-native";


const InputField =( { label, labelStyle, icon , secureTextEntry= false,
    containerStyle,
    inputStyle,
    iconStyle,
    className,
    placeholder,
    value,
    onChangeText,
    ... props
    }) =>(
 <KeyboardAvoidingView behaviour ={Platform.OS == "ios"? "padding" : "height"}>
 <TouchableWithoutFeedback onPress ={Keyboard.dismiss}>
 <View className="my-2 w-11/12 mx-auto">
 <Text className={`text-lg font-JakartaSemiBold mb-3 ${labelStyle}`}>
 {label}
 </Text>
 <View
 className={` flex flex-row justify-start items-center relative bg-neutral-100
     rounded-full border border-neutral-100 focus:border-primary-500
     ${containerStyle}`}>
{icon && (
    <Image source={icon} className={`w-6 h-6 ml-4 ${iconStyle}`} />
    )}
<TextInput
className={`rounded-full p-4 font-JakartaSemiBold text-[15px]
    flex-1 ${inputStyle} text-left`}
      placeholder={placeholder}
                placeholderTextColor="#6B7280"
                value={value}
                onChangeText={onChangeText}
 secureTextEntry={secureTextEntry}
 />
 </View>
 </View>
 </TouchableWithoutFeedback>
  </KeyboardAvoidingView>
    );

export default InputField;