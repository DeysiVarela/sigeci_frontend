import { createBrowserRouter } from "react-router";
import LoginScreen from "../pages/login/LoginScreen";
import ForgotPasswordScreen from "../pages/auth/ForgotPasswordScreen";
import ResetPinScreen from "../pages/auth/ResetPinScreen";
import DashboardScreen from "../pages/dashboard/DashboardScreen";
import ComponentsScreen from "../pages/components/ComponentsScreen";
import Dashboard from "../theme/containers/Dashboard";
import ArticleScreen from "../pages/article/ArticleScreen";
import ArticleViewScreen from "../pages/article/ArticleViewScreen";
import ArticleEditScreen from "../pages/article/ArticleEditScreen";
import UserScreen from "../pages/users/UserScreen";
import Container from "../theme/containers/Container";

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
    {
        path: "/",
        element: <Dashboard/>,
        children: [
            {
                index: true,
                element: <ComponentsScreen/>
            },
            {
                path: "/components",
                element: <ComponentsScreen/>
            },
            {
                path: "/home",
                element: <DashboardScreen/>
            },
            {
                path: "/article",
                element: <ArticleScreen/>
            },
            {
                path: "/article/:id",
                element: <ArticleViewScreen/>
            },
            {
                path: "/article/edit/:id",
                element: <ArticleEditScreen/>
            },
            {
                path: "/users",
                element: <UserScreen/>
            },
        ]
    }
]);

export default router;