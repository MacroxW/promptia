import type { Route } from "./+types/home";
import HomePage from "../pages/HomePage";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Promptia" },
    { name: "description", content: "Welcome to Promptia!" },
  ];
}

export default function Home() {
  return <HomePage />;
}
