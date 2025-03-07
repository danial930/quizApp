import { useCallback, useEffect, useState } from "react";
import { IoTrashSharp } from "react-icons/io5";
import api from "../../utils/urls";
import { useNavigate } from "react-router";
// import axios from "axios";

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

const QuizDashboard = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  const navigate = useNavigate();

  const initializeQuizes = useCallback(() => {
    api
      .get("/quizzes")
      .then((res) => {
        console.log(JSON.parse(res.data.data)[0]._id.$oid);
        setQuizzes(JSON.parse(res.data.data));
      })
      .catch((err) => {
        if (err.status === 401) {
          localStorage.removeItem("Qdata");
          navigate("/login");
        }
      });
  }, [navigate]);

  useEffect(() => {
    initializeQuizes();
  }, [initializeQuizes]);

  const addQuestion = () => {
    if (!currentQuiz) return;
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: "",
      options: [],
    };
    setCurrentQuiz({
      ...currentQuiz,
      questions: [...currentQuiz.questions, newQuestion],
    });
  };

  const addOption = (questionId: string) => {
    if (!currentQuiz) return;
    const newOption: Option = {
      id: Date.now().toString(),
      text: "",
      isCorrect: false,
    };
    setCurrentQuiz({
      ...currentQuiz,
      questions: currentQuiz.questions.map((q) =>
        q.id === questionId ? { ...q, options: [...q.options, newOption] } : q
      ),
    });
  };

  const saveQuiz = () => {
    if (!currentQuiz) {
      return;
    }

    const quizIndex = quizzes.findIndex((q) => q._id === currentQuiz._id);
    if (quizIndex === -1) {
      setQuizzes([...quizzes, currentQuiz]);
      console.log(currentQuiz);
      api.post("/quizzes", currentQuiz).then((res) => {
        console.log(res);
      });
    } else {
      console.log(quizIndex);
      api.put(`/quizzes/${currentQuiz._id}`, currentQuiz).then((res) => {
        console.log(res);
      });
      const updatedQuizzes = [...quizzes];
      updatedQuizzes[quizIndex] = currentQuiz;
      setQuizzes(updatedQuizzes);
    }
  };

  const handleScheduleQuiz = () => {
    if (!currentQuiz || !scheduleDate || !scheduleTime) return;

    const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
    const updatedQuiz = {
      ...currentQuiz,
      scheduledFor: scheduledDateTime,
      status: "scheduled" as const,
    };

    setCurrentQuiz(updatedQuiz);
    const quizIndex = quizzes.findIndex((q) => q._id === currentQuiz._id);
    const updatedQuizzes = [...quizzes];
    if (quizIndex === -1) {
      updatedQuizzes.push(updatedQuiz);
    } else {
      updatedQuizzes[quizIndex] = updatedQuiz;
    }
    setQuizzes(updatedQuizzes);
    setShowScheduleModal(false);
  };

  const createNewQuiz = () => {
    const newQuiz: Quiz = {
      _id: Date.now().toString(),
      topic: "",
      questions: [],
      status: "draft",
    };
    setCurrentQuiz(newQuiz);
  };

  const formatScheduleTime = (date?: Date) => {
    if (!date) return "";
    return new Date(date).toLocaleString();
  };

  const handleStartQuiz = (quizId: string) => {
    navigate("/main/scoreboard", { state: { quizId } });
  };

  return (
    <div className="min-h-screen">
      {/* Dashboard Layout */}
      <div className="flex h-screen pt-16">
        {/* Sidebar */}
        <aside className="w-80 border-r border-gray-200 fixed h-full overflow-y-auto">
          <div className="p-4">
            <button
              onClick={createNewQuiz}
              className="w-full dark:bg-black bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
            >
              <span className="text-lg">+</span>
              Create New Quiz
            </button>
          </div>

          <div className="border-t border-gray-200">
            {quizzes.map((quiz) => (
              <div
                key={quiz._id}
                className={`dark:bg-black border-b border-gray-200 cursor-pointer ${
                  currentQuiz?._id === quiz._id
                    ? "bg-blue-50"
                    : "hover:bg-gray-50"
                } dark:hover:bg-black/50 hover:bg-gray-200`}
              >
                <div className="p-4" onClick={() => setCurrentQuiz(quiz)}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">
                        {quiz.topic || "Untitled Quiz"}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {quiz.questions.length} questions
                      </p>
                      {quiz.scheduledFor && (
                        <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                          <span>📅</span>
                          {formatScheduleTime(quiz.scheduledFor)}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        api.delete(`/quizzes/${quiz._id}`);
                        setQuizzes(quizzes.filter((q) => q._id !== quiz._id));
                        setCurrentQuiz(null);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <IoTrashSharp />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-80 p-6">
          {currentQuiz ? (
            <div className="max-w-4xl mx-auto rounded-lg shadow-sm p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <input
                  type="text"
                  value={currentQuiz.topic}
                  onChange={(e) =>
                    setCurrentQuiz({ ...currentQuiz, topic: e.target.value })
                  }
                  placeholder="Quiz Topic"
                  className=" flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="flex gap-2">
                  {/* <button
                    onClick={() => setShowScheduleModal(true)}
                    className="text-blue-600 dark:text-white px-4 py-2 border border-gray-300 rounded-lg hover:bg-blue-600 hover:text-white dark:hover:bg-gray-50 dark:hover:text-black"
                  >
                    Schedule
                  </button> */}
                  <button
                    onClick={() => handleStartQuiz(currentQuiz._id)}
                    className="text-blue-600 dark:text-white px-4 py-2 border border-gray-300 rounded-lg hover:bg-blue-600 hover:text-white dark:hover:bg-gray-50 dark:hover:text-black "
                  >
                    Start Now
                  </button>
                  <button
                    onClick={() => saveQuiz()}
                    className="px-4 py-2 bg-blue-600 dark:bg-black text-white rounded-lg hover:bg-green-600"
                  >
                    Save Quiz
                  </button>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {currentQuiz.questions.map((question, qIndex) => (
                  <div
                    key={question.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <span className="text-gray-500 mt-2">
                        Question {qIndex + 1}
                      </span>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={question.text}
                          onChange={(e) => {
                            const updatedQuestions = [...currentQuiz.questions];
                            updatedQuestions[qIndex].text = e.target.value;
                            setCurrentQuiz({
                              ...currentQuiz,
                              questions: updatedQuestions,
                            });
                          }}
                          placeholder="Enter question text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <button
                        onClick={() => {
                          const updatedQuestions = currentQuiz.questions.filter(
                            (q) => q.id !== question.id
                          );
                          setCurrentQuiz({
                            ...currentQuiz,
                            questions: updatedQuestions,
                          });
                        }}
                        className="text-red-500 hover:text-red-700 mt-2"
                      >
                        <IoTrashSharp />
                      </button>
                    </div>

                    <div className="pl-20 space-y-2">
                      {question.options.map((option, oIndex) => (
                        <div
                          key={option.id}
                          className="flex items-center gap-4"
                        >
                          <button
                            onClick={() => {
                              const updatedQuestions = [
                                ...currentQuiz.questions,
                              ];

                              updatedQuestions[qIndex].options =
                                updatedQuestions[qIndex].options.map((o) => ({
                                  ...o,
                                  isCorrect: o.id === option.id,
                                }));
                              setCurrentQuiz({
                                ...currentQuiz,
                                questions: updatedQuestions,
                              });
                            }}
                            className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              option.isCorrect
                                ? "bg-green-500 text-white"
                                : "border border-gray-300"
                            }`}
                          >
                            {option.isCorrect && "✓"}
                          </button>
                          <input
                            type="text"
                            value={option.text}
                            onChange={(e) => {
                              const updatedQuestions = [
                                ...currentQuiz.questions,
                              ];

                              updatedQuestions[qIndex].options[oIndex].text =
                                e.target.value;
                              setCurrentQuiz({
                                ...currentQuiz,
                                questions: updatedQuestions,
                              });
                            }}
                            placeholder={`Option ${oIndex + 1}`}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />

                          <button
                            onClick={() => {
                              const updatedQuestions = [
                                ...currentQuiz.questions,
                              ];

                              updatedQuestions[qIndex].options =
                                updatedQuestions[qIndex].options.filter(
                                  (o) => o.id !== option.id
                                );
                              setCurrentQuiz({
                                ...currentQuiz,
                                questions: updatedQuestions,
                              });
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <IoTrashSharp />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addOption(question.id)}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        + Add Option
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={addQuestion}
                className="text-blue-600 dark:text-white w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-blue-600 hover:text-white dark:hover:bg-gray-50 dark:hover:text-black"
              >
                Add Question
              </button>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select a quiz from the sidebar or create a new one
            </div>
          )}
        </main>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white border-blue-600 border-2 rounded-lg p-6 w-full max-w-md dark:bg-black">
            <h2 className="text-xl font-bold mb-4">Schedule Quiz</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:text-black"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleQuiz}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizDashboard;
