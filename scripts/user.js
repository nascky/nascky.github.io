function getFirstName(fullName) {
    return fullName.split(' ')[0];
}

// Check authentication and handle user greeting
function handleUserAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userGreeting = document.getElementById('userGreeting');
    const isProtectedPage = document.body.classList.contains('protected-page');

    if (currentUser) {
        // User is logged in - show greeting dropdown
        const firstName = getFirstName(currentUser.name);
        
        userGreeting.innerHTML = `
            <div class="user-dropdown">
                <button class="user-dropdown-button">
                    Hi, ${firstName} <i class="fas fa-caret-down"></i>
                </button>
                <div class="dropdown-content">
                    <a href="attendee.html"><i class="fas fa-calendar-alt"></i> My Events</a>
                    <a href="profile.html"><i class="fas fa-user"></i> My Profile</a>
                    <button id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Logout</button>
                </div>
            </div>
        `;

        document.getElementById("logoutBtn").addEventListener("click", () => {
            localStorage.removeItem("currentUser");
            window.location.href = "index.html";
        });
    } else {
        // User is not logged in - show sign in button
        userGreeting.innerHTML = `
            <a href="signin.html?redirect=${encodeURIComponent(window.location.href)}">
                <button class="sign-in">Sign In</button>
            </a>
        `;

        // Redirect if this is a protected page
        if (isProtectedPage) {
            alert("You must be signed in to access this page.");
            window.location.href = `signin.html?redirect=${encodeURIComponent(window.location.href)}`;
        }
    }
}

// Run when DOM is loaded
document.addEventListener('DOMContentLoaded', handleUserAuth);