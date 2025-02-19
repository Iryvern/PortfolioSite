import { createSignal } from "solid-js";

function Profile() {
  const [newEmail, setNewEmail] = createSignal("");
  const [oldPassword, setOldPassword] = createSignal("");
  const [newPassword, setNewPassword] = createSignal("");
  const [responseMessage, setResponseMessage] = createSignal("");

  const getTokenFromCookies = () => {
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
      let [key, value] = cookie.split("=");
      if (key === "access_token") {
        return value;
      }
    }
    return "";
  };

  const handleLogout = () => {
    document.cookie = "username=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    window.location.hash = "#home";
    window.location.reload();
  };

  const handleUpdateEmail = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/update-email", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${getTokenFromCookies()}` 
        },
        body: JSON.stringify({ email: newEmail() }),
      });
      const result = await response.json();
      setResponseMessage(result.message || "Email updated successfully!");
    } catch (error) {
      setResponseMessage("An error occurred. Please try again.");
    }
  };

  const handleUpdatePassword = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/update-password", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${getTokenFromCookies()}` 
        },
        body: JSON.stringify({ old_password: oldPassword(), new_password: newPassword() }),
      });
      const result = await response.json();
      setResponseMessage(result.message || "Password updated successfully!");
    } catch (error) {
      setResponseMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="profile-container">
      <h2>Your Profile</h2>
      <div className="profile-info">
        <label>New Email:</label>
        <input type="email" placeholder="Enter new email" onInput={(e) => setNewEmail(e.target.value)} />
        <button onClick={handleUpdateEmail}>Update Email</button>
      </div>
      <div className="profile-info">
        <label>Old Password:</label>
        <input type="password" placeholder="Enter old password" onInput={(e) => setOldPassword(e.target.value)} />
        <label>New Password:</label>
        <input type="password" placeholder="Enter new password" onInput={(e) => setNewPassword(e.target.value)} />
        <button onClick={handleUpdatePassword}>Update Password</button>
      </div>
      {responseMessage() && <p className="response-message">{responseMessage()}</p>}
      <button className="logout-button" onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Profile;
