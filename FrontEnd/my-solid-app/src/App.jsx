import { createSignal, onMount, onCleanup, createEffect } from "solid-js";
import "./App.css";
import Register from "./Register";
import About from "./About";  
import Contact from "./Contact";
import Login from "./Login";
import Profile from "./Profile";
import LLM from "./LLM";
import Admin from "./Admin"; // Admin Page

function App() {
  const [currentPage, setCurrentPage] = createSignal(window.location.hash);
  const [username, setUsername] = createSignal("");
  const [userRole, setUserRole] = createSignal(""); 
  const [backendStatus, setBackendStatus] = createSignal(null);
  const [hoveredIndex, setHoveredIndex] = createSignal(null); // Track hovered card

  const backendUrl = "https://backend-production-47ab.up.railway.app";

  // Function to check backend connection
  const checkBackendConnection = async () => {
    try {
      const res = await fetch(`${backendUrl}`);
      const data = await res.json();
      setBackendStatus(res.ok && data.status.includes("MongoDB connected successfully") ? "✅" : "❌");
    } catch (error) {
      setBackendStatus("❌");
    }
  };

  // Function to get username and role from cookies
  const getCookieValue = (key) => {
    const cookie = document.cookie
      .split("; ")
      .find(row => row.startsWith(`${key}=`));
    return cookie ? cookie.split("=")[1] : "";
  };

  // Update username and user role on mount
  onMount(() => {
    setUsername(getCookieValue("username"));
    setUserRole(getCookieValue("user_role"));
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
      case "#admin":
        return userRole() === "admin" ? <Admin /> : <h2>Access Denied</h2>;
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
          <div className="homepage">
            <h2>Welcome to My Portfolio Website</h2>
            <p>Explore my work in AI, Software Development, and Web Technologies.</p>

            <div className="homepage-buttons">
              {[
                { title: "📖 About Me", text: "Learn about my background, expertise, and professional journey.", link: "#about" },
                { title: "📩 Contact Me", text: "Have questions? Get in touch with me via email or LinkedIn.", link: "#contact" },
                { title: "🔑 Login to Explore AI", text: "Access AI-powered features like the chatbot by logging in.", link: "#login" }
              ].map((item, index) => (
                <div 
                  key={index}
                  className={`homepage-card ${hoveredIndex() !== null && hoveredIndex() !== index ? "dimmed" : ""}`} 
                  onMouseEnter={() => setHoveredIndex(index)} 
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <a href={item.link}><button>Go</button></a>
                </div>
              ))}
            </div>
          </div>
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
        {username() && <a href="#llm">LLM</a>}
        {userRole() === "admin" && <a href="#admin">Admin</a>} {/* Only visible to Admins */}
        {!username() && <a href="#register">Register</a>}
        {!username() && <a href="#login">Login</a>}
        {username() && <a href="#myprofile">My Profile</a>}
      </nav>
      <main className="main">
        {renderPage()}
      </main>
      <footer className="footer">
        <span>&copy; 2025 Portfolio Website</span>
        <span className="server-status">Server Status: {backendStatus()}</span>
      </footer>
    </div>
  );
}

export default App;
