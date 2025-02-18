import { createSignal } from "solid-js";
import "./App.css";

function App() {
  const [count, setCount] = createSignal(0);

  return (
    <div className="container">
      <header className="header">
        <h1>My Solid.js Website</h1>
      </header>
      <nav className="nav">
        <a href="#home">Home</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </nav>
      <main className="main">
        <h2>Welcome to My Solid.js Website</h2>
        <p>This is a simple front page built with Solid.js.</p>
        <p>Counter: {count()}</p>
        <button className="button" onClick={() => setCount(count() + 1)}>Increment</button>
      </main>
      <footer className="footer">
        &copy; 2025 My Solid.js Website
      </footer>
    </div>
  );
}

export default App;