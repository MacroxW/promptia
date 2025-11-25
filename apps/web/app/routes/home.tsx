import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  //return <Welcome />;
  return (
    <div className="max-w-2x1 mx-auto mt-10 p-6 rounded shadow">
      <h1 className="text-3xl font-bold mb-4"> Bienvenido a Promptia</h1>

      <p className="text-blue-700 mb-6">
        PAGINA PRINCIPAL DE LA APP
      </p>

      <div className="flex gap-4">
        <a href="/chat" className="bg-blue-600 text-white px-4 py-2 rounded">
          Acceder al chat
        </a>

        <a href="/login" className="bg-gray-600 text-white px-4 py-2 rounded">
          Login
        </a>
      </div>



    </div>



  )

}
