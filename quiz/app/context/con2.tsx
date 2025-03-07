import { router } from "expo-router";
import React, { createContext, useContext, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  handleConnect: (quizId: string, name: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  const handleConnect = (quizId: string, name: string) => {
    const newSocket = io("http://localhost:8000", {
      query: { quizId, name },
    });

    setSocket(newSocket);

    newSocket.on("quizStarted", (quiz) => {
      router.push({ pathname: "/quiz", params: { quizId: quiz.id } });
    });
  };

  return (
    <SocketContext.Provider value={{ socket, handleConnect }}>
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
