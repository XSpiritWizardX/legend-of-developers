import { createBrowserRouter } from "react-router-dom";

import Game from "../components/Game/Game";
import LandingPage from "../components/LandingPage/LandingPage";
import LoginFormPage from "../components/LoginFormPage";
import SignupFormPage from "../components/SignupFormPage";
import Layout from "./Layout";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/game", element: <Game /> },
      { path: "/login", element: <LoginFormPage /> },
      { path: "/signup", element: <SignupFormPage /> },
    ],
  },
]);
