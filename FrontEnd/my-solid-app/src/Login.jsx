import { createSignal } from "solid-js";

const backendUrl = "https://backend-production-47ab.up.railway.app";

function Login() {
  const [username, setUsername] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [responseMessage, setResponseMessage] = createSignal("");

  const handleLogin = async () => {
    try {
      const response = await fetch(`${backendUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username(), password: password() }),
      });
      const result = await response.json();
      if (response.ok) {
        document.cookie = `username=${username()}; path=/;`;
        document.cookie = `access_token=${result.access_token}; path=/;`;
        document.cookie = `user_role=${result.role}; path=/;`; // Store user role

        // Redirect to main page and refresh
        window.location.hash = "#home";
        window.location.reload();
      } else {
        setResponseMessage(result.detail || "Invalid credentials.");
      }
    } catch (error) {
      setResponseMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="register-form fade-in">
      <h2>Login</h2>
      {responseMessage() && <p style={{ color: "red" }}>{responseMessage()}</p>}
      <input type="text" placeholder="Username" onInput={(e) => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" onInput={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;
