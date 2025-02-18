import { createSignal } from "solid-js";

function Login() {
  const [username, setUsername] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [responseMessage, setResponseMessage] = createSignal("");

  const handleLogin = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username(), password: password() }),
      });
      const result = await response.json();
      if (response.ok) {
        setResponseMessage("Login successful!");
      } else {
        setResponseMessage(result.detail || "Invalid credentials.");
      }
    } catch (error) {
      setResponseMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="register-form">
      <h2>Login</h2>
      {responseMessage() && <p style={{ color: "red" }}>{responseMessage()}</p>}
      <input type="text" placeholder="Username" onInput={(e) => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" onInput={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;
