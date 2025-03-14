import { createSignal } from "solid-js";

const backendUrl = "https://backend-production-47ab.up.railway.app";

function LLM() {
  const [message, setMessage] = createSignal("");
  const [messages, setMessages] = createSignal([]); // Stores conversation history
  const [loading, setLoading] = createSignal(false);

  const handleSendMessage = async () => {
    if (!message().trim()) return;

    const userMessage = { text: message(), sender: "user" };
    setMessages((prevMessages) => [...prevMessages, userMessage]); // Add user message only once

    setLoading(true);
    const userInput = message(); // Store user input before clearing it
    setMessage(""); // Clear input field

    try {
      const res = await fetch(`${backendUrl}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userInput }), // Send stored user input
      });

      const data = await res.json();
      const aiMessage = {
        text: res.ok ? data.response : `Error: ${data.detail}`,
        sender: "ai",
      };

      setMessages((prevMessages) => [...prevMessages, aiMessage]); // Append AI response
    } catch (error) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: "Failed to fetch response. Please try again.", sender: "ai" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="llm-container">
      <h2>LLM Chat</h2>
      <div className="chat-box">
        {messages().map((msg, index) => (
          <div key={index} className={`chat-bubble ${msg.sender}`}>
            {msg.text}
          </div>
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
      </div>
    </div>
  );
}

export default LLM;
