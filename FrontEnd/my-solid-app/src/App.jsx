import { createSignal, onCleanup } from "solid-js";
import "./App.css";
import Register from "./Register";
import About from "./About";  // Import About page
import Contact from "./Contact";
import Login from "./Login";

function App() {
  const [count, setCount] = createSignal(0);
  const [currentPage, setCurrentPage] = createSignal(window.location.hash);

  const renderPage = () => {
    switch (currentPage()) {
      case "#register":
        return <Register />;
      case "#about":
        return <About />;  
      case "#contact":
        return <Contact />; 
      case "#login":
        return <Login />; 
      default:
        return (
          <>
            <h2>Welcome to My Solid.js Website</h2>
            <p>This is a simple front page built with Solid.js.</p>
            <p>Counter: {count()}</p>
            <button className="button" onClick={() => setCount(count() + 1)}>Increment</button>
          </>
        );
    }
  };

  const updatePage = () => setCurrentPage(window.location.hash);
  window.addEventListener("hashchange", updatePage);
  onCleanup(() => window.removeEventListener("hashchange", updatePage));

  return (
    <div className="container">
      <header className="header">
        <h1>My Solid.js Website</h1>
      </header>
      <nav className="nav">
        <a href="#home">Home</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
        <a href="#register">Register</a>
        <a href="#login">Login</a>
      </nav>
      <main className="main">
        {renderPage()}
      </main>
      <footer className="footer">
        &copy; 2025 Portfolio Website 
      </footer>
    </div>
  );
}

export default App;
