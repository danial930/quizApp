import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { Input, Button, Text } from "@rneui/themed";

import { useSocket } from "./context/socket";

interface LoginScreenProps {
  onLogin?: (mobileNumber: string, password: string) => void;
  onOTPLogin?: () => void;
  onRegister?: () => void;
}

const ConnectScreen: React.FC<LoginScreenProps> = () => {
  const [name, setName] = useState("");
  const [quizId, setQuizId] = useState("");
  const { handleConnect } = useSocket();

  return (
    <View style={{ marginVertical: 50 }}>
      <Text
        style={{ fontSize: 18, margin: 10, color: "gray", fontWeight: "bold" }}
      >
        Enter Your Name and Quiz ID
      </Text>
      <Input placeholder="Name" value={name} onChangeText={setName} />
      <Input placeholder="Quiz ID" value={quizId} onChangeText={setQuizId} />
      <Button
        title="Connect"
        onPress={() => {
          handleConnect(quizId, name);
        }}
      />
    </View>
  );
};

export default ConnectScreen;
