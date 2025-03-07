import "./App.css";
import Login from "./components/auth/login";
import SignUp from "./components/auth/signup";
import Welcome from "./pages/Welcome";
import QuizDashboard from "./pages/quiz/quizMan";
import { Routes, Route } from "react-router";
import Quiz from "./socket/quiz";
import Scoreboard from "./pages/quiz/scoreBoard";
import Wrapper from "./pages/dashboard";

function App() {
  return (
    <>
      <Routes>
        <Route index element={<Welcome />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<SignUp />} />

        <Route path="main" element={<Wrapper />}>
          <Route index element={<QuizDashboard />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="scoreboard" element={<Scoreboard />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
