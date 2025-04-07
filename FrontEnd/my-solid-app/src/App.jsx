import { createSignal, onMount, onCleanup } from "solid-js";
import "./App.css";
import Register from "./Register";
import About from "./About";
import Contact from "./Contact";
import Login from "./Login";
import Profile from "./Profile";
import LLM from "./LLM";
import Admin from "./Admin";
import Timeline from "./Timeline";

// Import all three backgrounds
import Bg1 from "./assets/images/Full_Backgrounds/game_background_1.png";
import Bg2 from "./assets/images/Full_Backgrounds/game_background_3_2.png";
import Bg3 from "./assets/images/Full_Backgrounds/game_background_4.png";


function App() {
  const [currentPage, setCurrentPage] = createSignal(window.location.hash);
  const [username, setUsername] = createSignal("");
  const [userRole, setUserRole] = createSignal("");
  const [backendStatus, setBackendStatus] = createSignal(null);
  const [hoveredIndex, setHoveredIndex] = createSignal(null);

  const backendUrl = "https://backend-production-47ab.up.railway.app";

  // Three background images and index
  const backgrounds = [Bg1, Bg2, Bg3];
  const [backgroundIndex, setBackgroundIndex] = createSignal(0);
  const backgroundImage = () => backgrounds[backgroundIndex()];

  const toggleBackground = () => {
    setBackgroundIndex((prev) => (prev + 1) % backgrounds.length);
  };

  const checkBackendConnection = async () => {
    try {
      const res = await fetch(`${backendUrl}`);
      const data = await res.json();
      setBackendStatus(
        res.ok && data.status.includes("MongoDB connected successfully")
          ? "✅"
          : "❌"
      );
    } catch {
      setBackendStatus("❌");
    }
  };

  const getCookieValue = (key) => {
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${key}=`));
    return cookie ? cookie.split("=")[1] : "";
  };

  onMount(() => {
    setUsername(getCookieValue("username"));
    setUserRole(getCookieValue("user_role"));
    checkBackendConnection();
    window.addEventListener("hashchange", updatePage);
  });

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
      case "#timeline":
        return <Timeline />;
      case "#contact":
        return <Contact />;
      case "#login":
        return <Login />;
      case "#myprofile":
        return username() ? <Profile /> : <h2>Access Denied</h2>;
      default:
        return (
          <div className="homepage fade-in">
            <div className="clean">
            <h2 className="homepage fade-in">Welcome to My Website</h2>
            <p>
              Explore my work in AI, Software Development, and Web Technologies.
            </p>
            </div>

            <div className="homepage-buttons">
              {[
                {
                  title: "📖 About Me",
                  text: "Learn about my background, expertise, and professional journey.",
                  link: "#about",
                },
                {
                  title: "📩 Contact Me",
                  text: "Have questions? Get in touch with me via email or LinkedIn.",
                  link: "#contact",
                },
                ...(!username()
                  ? [
                      {
                        title: "🔑 Login to Explore AI",
                        text: "Access AI-powered features like the chatbot by logging in.",
                        link: "#login",
                      },
                    ]
                  : []),
              ].map((item, index) => (
                <div
                  key={index}
                  className={`homepage-card fade-up ${
                    hoveredIndex() !== null && hoveredIndex() !== index
                      ? "dimmed"
                      : ""
                  }`}
                  style={{ "--i": index }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <a href={item.link}>
                    <button>Go</button>
                  </a>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div
      style={{
        "background-image": `url(${backgroundImage()})`,
        "background-size": "cover",
        "background-position": "center",
        "background-repeat": "no-repeat",
        "background-attachment": "fixed", // ⭐ this keeps it in place!
        "min-height": "100vh",
        "width": "100%",
      }}
    >
      {/* Toggle background button */}
      <button
        onClick={toggleBackground}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          zIndex: 1000,
          padding: "0.5rem 1rem",
          fontSize: "1rem",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
        }}
      >
        Toggle Background
      </button>

      <div className="container">
        <header className="header fade-in">
          <h1 className="clean">Kirill's Sandbox</h1>
        </header>
        <nav className="nav fade-in">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#timeline">Timeline</a>
          <a href="#contact">Contact</a>
          {username() && <a href="#llm">LLM</a>}
          {userRole() === "admin" && <a href="#admin">Admin</a>}
          {!username() && <a href="#register">Register</a>}
          {!username() && <a href="#login">Login</a>}
          {username() && <a href="#myprofile">My Profile</a>}
        </nav>
        <main className="main fade-in">{renderPage()}</main>
        <footer className="footer fade-in">
          <span>&copy; 2025 Portfolio Website</span>
          <span className="server-status">
            Server Status: {backendStatus()}
          </span>
        </footer>
      </div>
    </div>
  );
}

export default App;