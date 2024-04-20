
import { useSignUp } from "@clerk/clerk-expo";
import { Stack, router } from "expo-router";
import * as React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
 
export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
 
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");
 
  // start the sign up process.
  const onSignUpPress = async () => {
    if (!isLoaded) {
      return;
    }
 
    try {
      await signUp.create({
        firstName,
        lastName,
        emailAddress,
        password,
      });
 
      // send the email.
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
 
      // change the UI to our pending section.
      setPendingVerification(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
    }
  };
 
  // This verifies the user using email code that is delivered.
  const onPressVerify = async () => {
    if (!isLoaded) {
      return;
    }
 
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });
 
      await setActive({ session: completeSignUp.createdSessionId });
      router.push("/(tabs)/")
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
    }
  };
 
  return (
    <View>
                <Stack.Screen options={{ headerShown: true, title: "Sign Up" } } />

      {!pendingVerification && (
        <View className="gap-y-4 mt-24">
          <View className="px-4 py-3 border w-10/12 rounded-xl mx-auto ">
            <TextInput
              autoCapitalize="none"
              value={firstName}
              placeholder="First Name..."
              onChangeText={(firstName) => setFirstName(firstName)}
            />
          </View>
          <View className="px-4 py-3 border w-10/12 rounded-xl mx-auto ">
            <TextInput
              autoCapitalize="none"
              value={lastName}
              placeholder="Last Name..."
              onChangeText={(lastName) => setLastName(lastName)}
            />
          </View>
          <View className="px-4 py-3 border w-10/12 rounded-xl mx-auto ">
            <TextInput
              autoCapitalize="none"
              value={emailAddress}
              placeholder="Email..."
              onChangeText={(email) => setEmailAddress(email)}
            />
          </View>
 
          <View className="px-4 py-3 border w-10/12 rounded-xl mx-auto mb-4 ">
            <TextInput
              value={password}
              placeholder="Password..."
              secureTextEntry={true}
              onChangeText={(password) => setPassword(password)}
            />
          </View>
 
          <TouchableOpacity className="w-2/5 bg-cyan-500 py-5 mx-auto rounded-xl" onPress={onSignUpPress}>
            <Text className="text-center text-white font-semibold">Sign up</Text>
          </TouchableOpacity>
        </View>
      )}
      {pendingVerification && (
        <View>
          <View>
            <TextInput
              value={code}
              placeholder="Code..."
              onChangeText={(code) => setCode(code)}
            />
          </View>
          <TouchableOpacity onPress={onPressVerify}>
            <Text>Verify Email</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}