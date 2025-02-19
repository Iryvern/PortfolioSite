function Profile() {
    const handleLogout = () => {
      // Clear cookies
      document.cookie = "username=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
  
      // Redirect to home page
      window.location.hash = "#home";
      window.location.reload(); // Ensure UI updates
    };
  
    return (
      <div>
        <h2>Your Profile</h2>
        <p>Stuff:</p>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }
  
  export default Profile;
  