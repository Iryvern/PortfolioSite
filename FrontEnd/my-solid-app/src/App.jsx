import { createSignal, onMount, onCleanup } from "solid-js";
import "./App.css";
import Register from "./Register";
import About from "./About";  
import Contact from "./Contact";
import Login from "./Login";
import Profile from "./Profile";
import LLM from "./LLM";

function App() {
  const [currentPage, setCurrentPage] = createSignal(window.location.hash);
  const [username, setUsername] = createSignal("");
  const [backendStatus, setBackendStatus] = createSignal("Checking backend connection...");

  const backendUrl = "https://backend-production-47ab.up.railway.app";

  // Function to check backend connection
  const checkBackendConnection = async () => {
    try {
      const res = await fetch(`${backendUrl}`);
      const data = await res.json();
      if (res.ok && data.status.includes("MongoDB connected successfully")) {
        setBackendStatus("✅ Backend Connected Successfully!");
      } else {
        setBackendStatus("❌ Backend Connection Failed.");
      }
    } catch (error) {
      setBackendStatus("❌ Backend Connection Failed.");
    }
  };

  // Function to get username from cookies
  const getUsernameFromCookies = () => {
    const cookie = document.cookie
      .split("; ")
      .find(row => row.startsWith("username="));
    return cookie ? cookie.split("=")[1] : "";
  };

  // Update username and check backend on mount
  onMount(() => {
    setUsername(getUsernameFromCookies());
    checkBackendConnection();
    window.addEventListener("hashchange", updatePage);
  });

  // Cleanup event listener on unmount
  onCleanup(() => {
    window.removeEventListener("hashchange", updatePage);
  });

  const updatePage = () => setCurrentPage(window.location.hash);

  const renderPage = () => {
    switch (currentPage()) {
      case "#register":
        return <Register />;
      case "#llm":
        return username() ? <LLM /> : <h2>Access Denied</h2>; 
      case "#about":
        return <About />;  
      case "#contact":
        return <Contact />; 
      case "#login":
        return <Login />; 
      case "#myprofile":
        return username() ? <Profile /> : <h2>Access Denied</h2>; 
      default:
        return (
          <>
            <h2>Welcome to My Portfolio Website</h2>
            <p>This website serves as a showcase of my expertise in Artificial Intelligence, Software Engineering, and Web Development.</p>
            <p>Explore my projects, experience, and technical skills, or get in touch via the contact page.</p>
            <p><strong>Backend Status:</strong> {backendStatus()}</p>
          </>
        );
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Experience Showcase Website</h1>
      </header>
      <nav className="nav">
        <a href="#home">Home</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
        {username() && <a href="#llm">LLM</a>} {/* LLM tab only appears if logged in */}
        {!username() && <a href="#register">Register</a>}
        {!username() && <a href="#login">Login</a>}
        {username() && <a href="#myprofile">My Profile</a>}
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
