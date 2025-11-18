import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("/chat", "pages/ChatPage.tsx"),
    route("/login", "pages/LoginPage.tsx"),
] satisfies RouteConfig;


