import { createSignal } from "solid-js";

function Services() {
  const [hoveredIndex, setHoveredIndex] = createSignal(null);
  const username = () => document.cookie.includes("username="); // Replace with signal if preferred

  const services = [
    {
      title: "🤖 Chatbot",
      text: "Conversational AI for websites, customer support, and more.",
      available: true,
      requiresLogin: true,
    },
    {
      title: "📚 Book Translation",
      text: "AI-powered multilingual book translation with editing tools.",
      available: false,
    },
    {
      title: "🎨 AI Manga Editor",
      text: "Automated paneling, speech bubble translation, and more.",
      available: false,
    },
    {
      title: "💼 Hire Us",
      text: "Custom AI solutions built for your business or project.",
      link: "#contact",
      available: true,
    },
  ];

  return (
    <div className="about-container fade-in">
      <h2>Our Services</h2>
      <p>Explore the AI-driven tools and services we currently offer:</p>

      <div className="homepage-buttons">
        {services.map((item, index) => {
          const isChatbot = item.title.includes("Chatbot");
          const isAvailable = item.available;
          const needsLogin = item.requiresLogin;
          const isLoggedIn = username();
          const link = isChatbot
            ? isLoggedIn
              ? "#llm"
              : "#login"
            : item.link;

          return (
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

              {isAvailable ? (
                <a href={link}>
                  <button
                    style={
                      !isLoggedIn && needsLogin
                        ? {
                            backgroundColor: "#888",
                            opacity: 0.85,
                          }
                        : {}
                    }
                    onClick={() => setHoveredIndex(null)}
                  >
                    {isChatbot && !isLoggedIn ? "Login Required" : "Go"}
                  </button>
                </a>
              ) : (
                <button
                  disabled
                  style={{
                    backgroundColor: "#555",
                    cursor: "not-allowed",
                    opacity: 0.6,
                  }}
                >
                  Coming Soon
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Services;
