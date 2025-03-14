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
  const [userRole, setUserRole] = createSignal(""); // Store user role
  const [backendStatus, setBackendStatus] = createSignal(null);

  const backendUrl = "https://backend-production-47ab.up.railway.app";

  // Function to check backend connection
  const checkBackendConnection = async () => {
    try {
      const res = await fetch(`${backendUrl}`);
      const data = await res.json();
      if (res.ok && data.status.includes("MongoDB connected successfully")) {
        setBackendStatus("✅");
      } else {
        setBackendStatus("❌");
      }
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

  // Generates a random color
  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // Adds hover event listeners
  const addHoverEffect = () => {
    const homepageCards = document.querySelectorAll(".homepage-card");
    const mainElement = document.querySelector(".main");

    if (!homepageCards || !mainElement) return;

    homepageCards.forEach(card => {
      card.addEventListener("mouseenter", () => {
        const randomColor = getRandomColor();
        mainElement.style.transition = "background-color 0.5s ease-in-out"; // Fade-in effect
        mainElement.style.backgroundColor = randomColor;
      });

      card.addEventListener("mouseleave", () => {
        mainElement.style.transition = "background-color 0.5s ease-in-out"; // Fade-out effect
        mainElement.style.backgroundColor = "";
      });
    });
  };

  // Ensures event listeners are reattached on page change
  createEffect(() => {
    addHoverEffect();
  });

  // Update username and user role on mount
  onMount(() => {
    setUsername(getCookieValue("username"));
    setUserRole(getCookieValue("user_role")); // Fetch user role from cookie
    checkBackendConnection();
    window.addEventListener("hashchange", updatePage);
    addHoverEffect();
  });

  // Cleanup event listener on unmount
  onCleanup(() => {
    window.removeEventListener("hashchange", updatePage);
  });

  const updatePage = () => {
    setCurrentPage(window.location.hash);
    setTimeout(() => {
      addHoverEffect(); // Ensure hover effect is applied after navigation
    }, 100);
  };

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
              <div className="homepage-card">
                <h3>📖 About Me</h3>
                <p>Learn about my background, expertise, and professional journey.</p>
                <a href="#about"><button>Visit About Page</button></a>
              </div>

              <div className="homepage-card">
                <h3>📩 Contact Me</h3>
                <p>Have questions? Get in touch with me via email or LinkedIn.</p>
                <a href="#contact"><button>Go to Contact Page</button></a>
              </div>

              <div className="homepage-card">
                <h3>🔑 Login to Explore AI</h3>
                <p>Access AI-powered features like the chatbot by logging in.</p>
                <a href="#login"><button>Login to Continue</button></a>
              </div>
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
