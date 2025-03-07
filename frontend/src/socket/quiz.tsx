import axios from "axios";
import { useState } from "react";

function Quiz() {
  const [quizId, setQuizId] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [receivedMessages, setReceivedMessages] = useState<string[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  // Function to create a quiz
  const createQuiz = async () => {
    axios.get("http://localhost:8000/create_quiz").then((res) => {
      console.log(res);
      setQuizId(res.data);
    });
  };

  const connectSocket = () => {
    if (quizId) {
      const ws = new WebSocket(`ws://127.0.0.1:8000/ws/${quizId}`);
      ws.onmessage = (event: MessageEvent) => {
        setReceivedMessages((prev) => [...prev, event.data]);
      };
      setSocket(ws);
    }
  };

  const sendMessage = () => {
    if (socket && message) {
      socket.send(message);
      setMessage("");
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Quiz quiz</h1>
      <div className="mb-4">
        <button
          onClick={createQuiz}
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Create Quiz
        </button>
        {quizId && (
          <div className="mt-2 text-lg">
            Your Quiz ID: <span className="font-mono">{quizId}</span>
          </div>
        )}
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Enter Quiz ID"
          value={quizId}
          onChange={(e) => setQuizId(e.target.value)}
          className="border p-2 rounded-md shadow-sm"
        />

        <button
          onClick={connectSocket}
          className="ml-2 px-4 py-2 bg-green-500 text-white rounded-md"
        >
          Connect
        </button>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Enter Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border p-2 rounded-md shadow-sm"
        />

        <button
          onClick={sendMessage}
          className="ml-2 px-4 py-2 bg-green-500 text-white rounded-md"
        >
          Send
        </button>
      </div>
      <div className="w-full max-w-lg bg-white shadow-md rounded-md p-4 text-black">
        <h2 className="text-lg font-semibold mb-2">Received Messages</h2>
        <ul className="list-disc list-inside">
          {receivedMessages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Quiz;
