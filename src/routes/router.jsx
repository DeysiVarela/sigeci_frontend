import { createBrowserRouter } from "react-router";
import LoginScreen from "../pages/auth/LoginScreen";
import ForgotPasswordScreen from "../pages/auth/ForgotPasswordScreen";
import ResetPinScreen from "../pages/auth/ResetPinScreen";
import RegisterScreen from "../pages/auth/RegisterScreen";
import DashboardScreen from "../pages/dashboard/DashboardScreen";
import ComponentsScreen from "../pages/components/ComponentsScreen";
import Dashboard from "../theme/containers/Dashboard";
import ArticleScreen from "../pages/article/ArticleScreen";
import ArticleViewScreen from "../pages/article/ArticleViewScreen";
import ArticleFormScreen from "../pages/article/ArticleFormScreen";
import UserScreen from "../pages/users/UserScreen";
import UserFormScreen from "../pages/users/UserFormScreen";
import UserViewScreen from "../pages/users/UserViewScreen";
import UserProfileScreen from "../pages/users/UserProfileScreen";
import Container from "../theme/containers/Container";
import ProtectedRoute from "./ProtectedRoute";

const router = createBrowserRouter([
    {
        path: "/login",
        element: <Container />,
        children: [
            {
                index: true,
                element: <LoginScreen />,
            }
        ]
    },
    {
        path: "/forgot-password",
        element: <Container />,
        children: [
            {
                index: true,
                element: <ForgotPasswordScreen />,
            }
        ]
    },
    {
        path: "/reset-pin",
        element: <Container />,
        children: [
            {
                index: true,
                element: <ResetPinScreen />,
            }
        ]
    },
    { path: "/register", element: <Container />, children: [{ index: true, element: <RegisterScreen /> }] },
    {
        path: "/",
        element: <ProtectedRoute />,
        children: [
            {
                element: <Dashboard />, children: [
                    { index: true, element: <ComponentsScreen /> },
                    { path: "/components", element: <ComponentsScreen /> },
                    { path: "/home", element: <DashboardScreen /> },
                    { path: "/article", element: <ArticleScreen /> },
                    { path: "/article/:id", element: <ArticleViewScreen /> },
                    { path: "/article/edit/:id", element: <ArticleFormScreen /> },
                    { path: "/article/create", element: <ArticleFormScreen /> },
                    { path: "/users", element: <UserScreen /> },
                    { path: "/users/:id", element: <UserViewScreen /> },
                    { path: "/users/edit/:id", element: <UserFormScreen /> },
                    { path: "/users/create", element: <UserFormScreen /> },
                    { path: "/profile", element: <UserProfileScreen /> }
                ]
            }
        ]
    }
]);

export default router;