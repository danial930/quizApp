import { router } from "expo-router";
import React, { createContext, useContext, useState, useEffect } from "react";

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  text: string;
  options: Option[];
}

interface Quiz {
  _id: string;
  topic: string;
  questions: Question[];
  scheduledFor?: Date;
  status: "draft" | "scheduled" | "active" | "completed";
}

interface SocketContextType {
  socket: WebSocket | null;
  handleConnect: (quizId: string, name: string) => void;
  quiz: Quiz | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  const handleConnect = (quizId: string, name: string) => {
    console.log("ind con", quizId, name);
    const clientId = `student-${Date.now()}`;
    const ws = new WebSocket(`ws://192.168.3.137:8000/ws/${clientId}`); // Use 10.0.2.2 for Android emulator

    ws.onopen = () => {
      console.log("WebSocket Connected");
      ws.send(
        JSON.stringify({
          type: "studentConnect",
          quizId,
          name,
        })
      );
    };
    // 1739037562905

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // const data2 = JSON.parse(data.data.data);

      switch (data.type) {
        case "quizData":
          setQuiz(data.data);
          console.log("quiz:", quiz);
          console.log("data", data);
          router.push({
            pathname: "/quiz",
            params: { quizId },
          });
          break;
        case "quizStarted":
          router.push({
            pathname: "/quiz",
            params: { quizId },
          });
          break;
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
      setSocket(null);
    };

    setSocket(ws);
  };

  // useEffect(() => {
  //   return () => {
  //     if (socket) {
  //       socket.close();
  //     }
  //   };
  // }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, handleConnect, quiz }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
