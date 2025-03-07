import React, { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router";

interface Student {
  id: string;
  name: string;
  status: "connected" | "finished";
  score: number;
  style: React.CSSProperties;
}

const Scoreboard: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [soc, setsoc] = useState<WebSocket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initQuiz, setInitQuiz] = useState<boolean>(true);
  const [startQuiz, setStartQuiz] = useState<boolean>(false);
  const location = useLocation();
  const { quizId } = location.state || {};

  const connectWebSocket = useCallback(() => {
    const clientId = `teacher-${Date.now()}`;
    const wsUrl = `ws://localhost:8000/ws/${clientId}`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      setError(null);
      setWs(socket);
    };

    socket.onclose = () => {
      setError("Connection closed");
      setTimeout(connectWebSocket, 3000);
    };

    socket.onerror = (error) => {
      setError(JSON.stringify(error));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "studentConnected":
          setStudents((prev) => [...prev, data.data]);
          setStartQuiz(false);
          break;
        case "studentDisconnected":
          setStudents((prev) => prev.filter((s) => s.id !== data.data.id));
          break;
        case "studentProgress":
          setStudents((prev) => {
            const currentPositions = new Map(prev.map((s, i) => [s.id, i]));
            const updatedStudents = prev.map((s) =>
              s.id === data.data.id ? data.data : s
            );
            const sortedStudents = updatedStudents.sort(
              (a, b) => b.score - a.score
            );

            return sortedStudents.map((student, newIndex) => {
              const oldIndex = currentPositions.get(student.id) || 0;
              const moveDistance = newIndex - oldIndex;
              return {
                ...student,
                style: {
                  animation:
                    moveDistance !== 0
                      ? `slide${
                          moveDistance > 0 ? "Down" : "Up"
                        } 0.5s ease-in-out`
                      : "",
                },
              };
            });
          });
          break;
        case "studentFinished":
          setStudents((prev) =>
            prev.map((s) => (s.id === data.data.id ? data.data : s))
          );
          break;
      }
    };

    return socket;
  }, []);

  const handleInitQuiz = () => {
    const socket = connectWebSocket();
    setsoc(socket);
    setInitQuiz(false);
  };

  useEffect(() => {
    return () => {
      soc?.close();
    };
  }, [soc]);

  const handleStartQuiz = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      setError("Not connected to server");
      return;
    }

    ws.send(
      JSON.stringify({
        type: "startQuiz",
        quizId: quizId,
      })
    );
    setStartQuiz(true);
  };

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="h-screen flex items-center dark:bg-gray-900 p-6">
      <style>
        {`
          @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0.5; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes slideDown {
            from { transform: translateY(-100%); opacity: 0.5; }
            to { transform: translateY(0); opacity: 1; }
          }
          .student-item {
            position: relative;
            transform-origin: center;
            will-change: transform;
          }
        `}
      </style>
      <div className="w-200 max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Quiz ID:{" "}
            <span className="text-blue-600 dark:text-blue-400">{quizId}</span>
          </h1>

          {initQuiz ? (
            <button
              onClick={handleInitQuiz}
              className="mb-8 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              Initialize Quiz
            </button>
          ) : (
            <div>
              {startQuiz ? (
                <p className="inline mx-10 text-gray-500 dark:text-gray-400">
                  Quiz in progress
                </p>
              ) : (
                <>
                  <button
                    onClick={handleStartQuiz}
                    className="mb-8 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                  >
                    Start Quiz
                  </button>
                  <p className="inline mx-10 text-gray-500 dark:text-gray-400">
                    You can start the quiz when most students are connected
                  </p>
                </>
              )}
            </div>
          )}

          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {students.map((student: Student) => (
                <li
                  key={student.id}
                  className="student-item flex items-center justify-between p-4 bg-black/50 dark:hover:bg-gray-750"
                  style={student.style}
                >
                  <div className="flex items-center space-x-4">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {student.name}
                    </span>
                    <span
                      className={`px-2 py-1 text-sm rounded-full ${
                        student.status === "connected"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      }`}
                    >
                      {student.status}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600 dark:text-gray-300">
                      Score:
                    </span>
                    <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                      {student.score}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {initQuiz ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                Initialize the quiz, Students will be able to connect once
                initialization is complete
              </p>
            </div>
          ) : (
            <>
              {students.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    Quiz initialized but, no students have joined yet
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Scoreboard;
