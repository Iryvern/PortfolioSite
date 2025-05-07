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
import Background from "./Background";
import Services from "./Services";
import Logo from "./assets/images/other/logo.png";

function App() {
  const [currentPage, setCurrentPage] = createSignal(window.location.hash);
  const [username, setUsername] = createSignal("");
  const [userRole, setUserRole] = createSignal("");
  const [backendStatus, setBackendStatus] = createSignal(null);
  const [hoveredIndex, setHoveredIndex] = createSignal(null);

  const backendUrl = "https://backend-production-47ab.up.railway.app";

  // Background switching logic
  const backgrounds = ["bg1", "bg3", "bg4"];

  const initialIndex = Number(sessionStorage.getItem("backgroundIndex")) || 0;
  const [backgroundIndex, setBackgroundIndex] = createSignal(initialIndex);
  const currentBackground = () => backgrounds[backgroundIndex()];
  

  const switchBackground = () => {
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
      case "#services":
        return <Services />;
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
              <h2 className="homepage fade-in">Unlock AI Creativity in the Cloud</h2>
              <p>
                Access powerful AI tools with our flexible token system.
              </p>

              <div className="homepage-buttons">
                <a href="#login">
                  <button>Login</button>
                </a>
                <a href="#register">
                  <button>Register</button>
                </a>
              </div>
            </div>

            <div className="homepage-buttons">
              {[
                {
                  title: "📖 About Us",
                  text: "Learn about the company and it's founders.",
                  link: "#about",
                },
                {
                  title: "📩 Contact Me",
                  text: "Have questions? Get in touch with us via email or LinkedIn.",
                  link: "#contact",
                },
                {
                  title: "🛠️ Services",
                  text: "Access AI-powered features and explore what we offer.",
                  link: "#services",
                },
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
                    <button onClick={() => setHoveredIndex(null)}>Explore</button>
                  </a>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <Background background={currentBackground()} />
      <div className="container" style={{ zIndex: -10 }}>
      <header className="header fade-in">
        <div className="header-content">
          <button
            onClick={() => {
              const nextIndex = (backgroundIndex() + 1) % backgrounds.length;
              sessionStorage.setItem("backgroundIndex", nextIndex);
              window.location.reload();
            }}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <img
              src={Logo}
              alt="Logo"
              className="logo"
              style={{ height: "50px", marginRight: "0.5rem" }}
            />
          </button>
          <h1 className="title">CaeliSoft</h1>
        </div>

        <nav className="nav">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#timeline">Timeline</a>
          <a href="#contact">Contact</a>
          {userRole() === "admin" && <a href="#admin">Admin</a>}
          {!username() && <a href="#login">Login</a>}
          {!username() && <a href="#register">Register</a>}
          {username() && <a href="#myprofile">My Profile</a>}
        </nav>
      </header>
        <main className="main fade-in">{renderPage()}</main>
        <footer className="footer fade-in">
          <span>&copy; 2025 Portfolio Website</span>
          <span className="server-status">
            Server Status: {backendStatus()}
          </span>
        </footer>
      </div>
    </>
  );
}

export default App;
