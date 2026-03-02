import {Tabs} from "expo-router";
import {Image, View} from "react-native";
import {icons} from "@/constants/onboarding";
import { ImageSourcePropType } from "react-native";
const TabIcon=( {
    source,
    focused,
    }:
    { source: ImageSourcePropType;
        focused: boolean;
        })=>(
    <View
    className={`flex flex-row justify-center items-center
    rounded-full ${focused ? "bg-emerald-500" :  ""}`}

    >
    <View
    className ={`rounded-full w-12 h-12 items-center
        justify-center ${focused ? "bg-emerald-500" : ""}`}
        >
    <Image source={source} tintColor ="white"
    resizeMode="contain"
    className="w-8 h-8"
    />
        </View>
    </View>
    )
const _layout = () => (
   <Tabs
   screenOptions={{
       tabBarShowLabel: false,
       tabBarStyle: {
           backgroundColor: "#333333",
           borderRadius:50,
           paddingBottom: 25,
                overflow:"hidden",
           marginHorizontal: 20,
           marginBottom:20,
           height: 78,
           display: "flex",
           justifyContent: "space-between",
            alignItems: "center",
            flexDirection: "row",
           position: "absolute",
           },
       }}>
   <Tabs.Screen
   name="home"
   options={{
       title:'Home',
       headerShown:false,
       tabBarIcon: ({focused}) =>(
           <TabIcon  focused={focused}
       source = {icons.home} />
       ),
       }}
   />
     <Tabs.Screen
      name="rides"
      options={{
          title:'Rides',
          headerShown:false,
          tabBarIcon: ({focused}) => (
              <TabIcon  focused={focused}
          source = {icons.list} />
          ),
          }}
      />
        <Tabs.Screen
         name="chat"
         options={{
             title:'Chat',
             headerShown:false,
             tabBarIcon: ({focused}) => (
                 <TabIcon  focused={focused}
             source = {icons.chat} />
             ),
             }}
         />
           <Tabs.Screen
            name="profile"
            options={{
                title:'Profile',
                headerShown:false,
                tabBarIcon: ({focused}) => (
                    <TabIcon  focused={focused}
                source = {icons.profile} />
                ),
                }}
            />
      </Tabs>
  );

export default _layout;