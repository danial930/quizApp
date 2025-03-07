import { useCallback, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";

export default function Wrapper() {
  const handleLogout = () => {
    localStorage.removeItem("Qdata");
  };

  const navigate = useNavigate();

  const checkAuth = useCallback(() => {
    const auth = localStorage.getItem("Qdata");
    if (!auth) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div>
      <nav className="bg-blue-600 text-white fixed w-full z-10 border border-1 dark:bg-black">
        <div className="px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold">Quiz App</h1>
          <NavLink
            to={"/login"}
            replace
            onClick={handleLogout}
            className="px-4 py-2 bg-blue-600 dark:bg-gray-100/20 text-white rounded-lg dark:hover:bg-red-600 "
          >
            Logout
          </NavLink>
        </div>
      </nav>
      <Outlet />
    </div>
  );
}
