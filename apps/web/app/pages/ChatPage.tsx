import { useState } from "react";

const ChatPage = () => {

    const [messages, setMessages] = useState<{
        sender: "user" | "bot";
        text: string
    }[]>([])

    const [input, setInput] = useState("")

    const handleSend = () => {
        if(!input.trim()){
            return
        }

        setMessages([...messages, {sender: "user", text: input}])
        setInput("")

        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                { sender: "bot", text:"Respuesta simulada del señor Bot."},
            ])
        },1000)
    }


    return (
        <div className="max-w-lg mx-auto mt-10 p-5 border rounded shadow"> 
            <h1 className="text-2xl font-bold mb-4">Chat</h1>

            <div className="border p-3 h-80 overflow-y-auto mb-4 rounded bg-gray-100">
                {messages.map((m, i) =>(
                    <div key={i} className={`p-2 my-1 rounded ${m.sender === "user" ? "bg-blue-500 text-white ml-auto w-fit" : "bg-gray-300 w-fit"}`}>
                        {m.text}
                    </div>
                ))}
            </div> 

            <div className="flex gap-2">
                <input 
                type="text" 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                className="border border-gray-300 rounded p-2 flex-1 text-white"
                placeholder="Escribi un mensaje..."/>

                <button onClick={handleSend} className="bg-green-600 text-white px-4 py-2 rounded">
                    Enviar
                </button>

            </div>

        </div>
        

    );
};

export default ChatPage;