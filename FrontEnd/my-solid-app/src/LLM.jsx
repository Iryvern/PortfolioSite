import { createSignal } from "solid-js";

const backendUrl = "https://backend-production-47ab.up.railway.app";

function LLM() {
  const [message, setMessage] = createSignal("");
  const [response, setResponse] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  const handleSendMessage = async () => {
    if (!message().trim()) return;

    setLoading(true);
    setResponse(""); // Clear previous response

    try {
      const res = await fetch(`${backendUrl}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: message() }),
      });

      const data = await res.json();
      if (res.ok) {
        setResponse(data.response);
      } else {
        setResponse(`Error: ${data.detail}`);
      }
    } catch (error) {
      setResponse("Failed to fetch response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="llm-container">
      <h2>LLM Chat</h2>
      <input
        type="text"
        placeholder="Enter your message..."
        onInput={(e) => setMessage(e.target.value)}
      />
      <button onClick={handleSendMessage} disabled={loading()}>
        {loading() ? "Loading..." : "Send"}
      </button>
      {response() && <p className="llm-response">{response()}</p>}
    </div>
  );
}

export default LLM;
