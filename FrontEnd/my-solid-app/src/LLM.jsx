import { createSignal, onMount } from "solid-js";
import { marked } from "marked";
import "./LLM.css";

const backendUrl = "https://backend-production-47ab.up.railway.app";

function LLM() {
  const [message, setMessage] = createSignal("");
  const [messages, setMessages] = createSignal([]);
  const [loading, setLoading] = createSignal(false);

  onMount(() => {
    const stored = sessionStorage.getItem("chat_history");
    if (stored) setMessages(JSON.parse(stored));
  });

  const persistMessages = (msgs) => {
    setMessages(msgs);
    sessionStorage.setItem("chat_history", JSON.stringify(msgs));
  };

  const clearChat = () => {
    sessionStorage.removeItem("chat_history");
    setMessages([]);
  };

  const handleSendMessage = async () => {
    if (!message().trim()) return;

    const userMessage = { text: message(), sender: "user" };
    const newMessages = [...messages(), userMessage];
    persistMessages(newMessages);

    setLoading(true);
    const userInput = message();
    setMessage("");

    try {
      const res = await fetch(`${backendUrl}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userInput }),
      });

      const data = await res.json();
      const aiMessage = {
        text: res.ok ? data.response : `Error: ${data.detail}`,
        sender: "ai",
      };

      persistMessages([...newMessages, aiMessage]);
    } catch (error) {
      persistMessages([
        ...newMessages,
        { text: "Failed to fetch response. Please try again.", sender: "ai" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="llm-container fade-in">
      <h2>LLM Chat</h2> 
      <div className="chat-box">
        {messages().map((msg, index) => (
          <div
            key={index}
            className={`chat-bubble ${msg.sender}`}
            innerHTML={msg.text.replace(/\n/g, "<br>")}
          />
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          placeholder="Enter your message..."
          value={message()}
          onInput={(e) => setMessage(e.target.value)}
        />
        <button onClick={handleSendMessage} disabled={loading()}>
          {loading() ? "Loading..." : "Send"}
        </button>
        <button className="clear-button" onClick={clearChat}>
          Clear Chat
        </button>
      </div>
    </div>
  );  
}

export default LLM;
