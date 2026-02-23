import {TouchableOpacity, Text} from "react-native";

const getBgVariantStyle =(variant: ButterProps["bgVariant"]) => {
    switch(variant){
        case "secondary":
        return "bg-gray-500";
        case"danger":
        return "bg-red-500";
        case "success":
        return "bg-green-500";
        case "outline":
          return "bg-white border border-[#DADCE0]";
        default:
            return 'bg-[#0286FF]';
        }
    };
const getTextVariantStyle=(variant: ButterProps["textVariants"]) => {
    switch(variant){
        case"primary":
        return "text-black";
        case"secondary":
        return "text-gray-100";
         case "danger":
                return "text-red-100";
        case "success":
        return "text-green-100";
        default:
            return 'text-white';
        }
    };
const CustomButton =(
    {onPress,
    title,
    bgVariant="primary",
    textVariants="default",
     IconLeft,
     IconRight,
     className,
     }: ButterProps) =>{
         return(
    <TouchableOpacity
     onPress ={onPress}
      className={`w-11/12 mx-auto rounded-full p-3 flex flex-row justify-center items-center shadow-md shadow-neutral-400/70 ${getBgVariantStyle(bgVariant)} ${className}`}
            >
    {IconLeft && <IconLeft />}
    <Text className={`text-[15px] font-medium ${getTextVariantStyle(textVariants)}`}
    >
    {title}
    </Text>
    {IconRight && <IconRight />}
    </TouchableOpacity>
    );
};
export default CustomButton;