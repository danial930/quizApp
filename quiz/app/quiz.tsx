import React, { useState, useEffect } from "react";
import { Button, Text } from "@rneui/themed";
import { View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useSocket } from "./context/socket";

const QuizScreen: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);

  const { socket, quiz } = useSocket();

  const handleMessage = (event: MessageEvent) => {
    const data = JSON.parse(event.data);
    if (data.type === "quizStarted") {
      console.log("quiz started");
      setQuizStarted(true);
    }
  };

  useEffect(() => {
    if (!socket || !quiz) return;

    socket.addEventListener("message", handleMessage);
  }, [socket, quiz]);

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      const newScore = score + 1;
      setScore(newScore);

      if (socket) {
        socket.send(
          JSON.stringify({
            type: "studentProgress",
            score: newScore,
          })
        );
      }
    }
    setCurrentQuestionIndex((prev) => prev + 1);
  };
  //   1739037562905

  const handleFinish = () => {
    console.log("finished click");
    socket?.send(
      JSON.stringify({
        type: "quizFinished",
        status: "finished",
      })
    );
    router.back();
  };
  if (!quiz) {
    return (
      <View style={styles.container}>
        <Text>Loading quiz...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text h4>Quiz: {quiz.topic}</Text>
      {quizStarted ? (
        currentQuestionIndex < quiz.questions.length ? (
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>
              {quiz.questions[currentQuestionIndex].text}
            </Text>
            {quiz.questions[currentQuestionIndex].options.map((option) => (
              <Button
                key={option.id}
                title={option.text}
                onPress={() => handleAnswer(option.isCorrect)}
                containerStyle={styles.buttonContainer}
              />
            ))}
          </View>
        ) : (
          <>
            <Text h4 style={styles.scoreText}>
              Quiz Finished! Your Score: {score}
            </Text>
            <Button onPress={() => handleFinish()}>finish</Button>
          </>
        )
      ) : (
        <>
          <Text style={styles.waitingText}>
            Waiting for the teacher to start the quiz...
          </Text>
          <Button onPress={() => router.back()}>back</Button>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  questionContainer: {
    marginTop: 20,
  },
  questionText: {
    fontSize: 18,
    marginBottom: 20,
  },
  buttonContainer: {
    marginVertical: 5,
  },
  scoreText: {
    textAlign: "center",
    marginTop: 20,
  },
  waitingText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
});

export default QuizScreen;
