// import React, { useState } from "react";

interface Student {
  id: string;
  name: string;
  score: number;
}

const Leaderboard: React.FC = () => {
  const students: Array<Student> = [{ id: "123", name: "damoal", score: 123 }];

  return (
    <div className="h-screen flex justify-center items-center ">
      <div className="w-full max-w-3xl shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-center justify-center text-gray-800 mb-4 dark:text-white">
          📊 Live Leaderboard
        </h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="p-3">Rank</th>
              <th className="p-3">Student</th>
              <th className="p-3">Score</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student.id} className="border-b ">
                <td className="p-3 font-bold">#{index + 1}</td>
                <td className="p-3">{student.name}</td>
                <td className="p-3">{student.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
