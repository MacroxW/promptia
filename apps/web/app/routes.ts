import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("/chat/:sessionId?", "pages/ChatPage.tsx"),
    route("/login", "pages/LoginPage.tsx"),
    route("/register", "pages/RegisterPage.tsx"),
] satisfies RouteConfig;


