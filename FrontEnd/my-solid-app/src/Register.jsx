import { createSignal, createMemo } from "solid-js";
const backendUrl = "https://backend-production-47ab.up.railway.app";

function Register() {
  const [username, setUsername] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [repeatPassword, setRepeatPassword] = createSignal("");
  const [responseMessage, setResponseMessage] = createSignal("");

  const passwordValidations = createMemo(() => {
    const value = password();
    return {
      length: value.length >= 5,
      upper: /[A-Z]/.test(value),
      lower: /[a-z]/.test(value),
      number: /\d/.test(value),
      special: /[!@#$%^&*(),.?\":{}|<>]/.test(value)
    };
  });

  const handleRegister = async () => {
    if (password() !== repeatPassword()) {
      setResponseMessage("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username(), email: email(), password: password() }),
      });
      const result = await response.json();
      if (response.ok) {
        setResponseMessage("Registration successful!");
      } else {
        setResponseMessage(result.detail || "Registration failed.");
      }
    } catch (error) {
      setResponseMessage("An error occurred. Please try again.");
    }
  };

  const renderBullet = (label, condition) => (
    <li style={{ color: condition ? "green" : "red" }}>{label}</li>
  );

  return (
    <div className="register-form">
      <h2>Register Account</h2>
      {responseMessage() && <p style={{ color: "red" }}>{responseMessage()}</p>}
      <input type="text" placeholder="Username" onInput={(e) => setUsername(e.target.value)} />
      <input type="email" placeholder="Email" onInput={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onInput={(e) => setPassword(e.target.value)} />
      <ul>
        {renderBullet("At least 5 characters", passwordValidations().length)}
        {renderBullet("One uppercase letter", passwordValidations().upper)}
        {renderBullet("One lowercase letter", passwordValidations().lower)}
        {renderBullet("One number", passwordValidations().number)}
        {renderBullet("One special character", passwordValidations().special)}
      </ul>
      <input type="password" placeholder="Repeat Password" onInput={(e) => setRepeatPassword(e.target.value)} />
      <button onClick={handleRegister}>Register</button>
    </div>
  );
}

export default Register;
