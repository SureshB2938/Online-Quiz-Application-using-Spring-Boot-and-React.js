import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Header = () => {
  const [showProfile, setShowProfile] = useState(true);

  const toggleProfile = () => {
    setShowProfile(!showProfile);
  };

  // Auto-hide the profile banner after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowProfile(false);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Developer Profile Banner - Minimal Style */}
      {showProfile && (
        <div style={styles.profileBanner}>
          <div style={styles.profileCard}>
            {/* Close Button */}
            <button onClick={toggleProfile} style={styles.closeButton}>
              ✕
            </button>
            
            {/* Profile Header */}
            <div style={styles.profileHeader}>
              <div style={styles.profileAvatar}>SB</div>
              <div style={styles.profileInfo}>
                <h3 style={styles.profileName}>Suresh B</h3>
                <p style={styles.profileTitle}>Java Full Stack Developer</p>
              </div>
            </div>
            
            {/* Social Links - Just Logos */}
            <div style={styles.socialLinks}>
              <a 
                href="https://www.linkedin.com/in/suresh-suri-softwaredeveloper/" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={styles.socialLink}
                title="LinkedIn Profile"
              >
                <svg style={styles.socialIcon} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              
              <a 
                href="https://github.com/SureshB2938" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={styles.socialLink}
                title="GitHub Profile"
              >
                <svg style={styles.socialIcon} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Main Header - Fixed position */}
      <header style={styles.header}>
        <div style={styles.container}>
          <img 
            src="/images/online-education.gif" 
            alt="Online Education" 
            style={styles.gif}
          />
          <div style={styles.centerTitle}>
            ONLINE EXAM SYSTEM
          </div>
          <nav style={styles.nav}>
            <button 
              onClick={toggleProfile}
              style={styles.devButton}
              title="Developer Profile"
            >
              👨‍💻 Developer
            </button>
            <Link to="/" style={styles.link}>
              Login
            </Link>
            <Link to="/register" style={styles.link}>
              Register
            </Link>
            <Link to="/admin" style={styles.link}>
              Admin
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
};

const styles = {
  header: {
    backgroundColor: "#1c2640ff",
    color: "white",
    position: "fixed",
    top: "0",
    left: 0,
    width: "100%",
    zIndex: 1000,
    padding: "12px 0",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
  },
  container: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 20px",
    position: "relative",
  },
  gif: {
    width: "40px",
    height: "40px",
    objectFit: "contain",
  },
  centerTitle: {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    fontWeight: "600",
    fontSize: "1.2rem",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    whiteSpace: "nowrap",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginLeft: "auto",
  },
  link: {
    color: "white",
    textDecoration: "none",
    fontWeight: "500",
    fontSize: "1rem",
    transition: "all 0.3s ease",
    padding: "8px 12px",
    borderRadius: "4px",
  },
  devButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "1rem",
    transition: "all 0.3s ease",
  },

  // Minimal Profile Banner Styles
  profileBanner: {
    position: "fixed",
    top: "80px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 2000,
    animation: "fadeInDown 0.6s ease-out",
    maxWidth: "300px",
    width: "90%",
  },
  profileCard: {
    backgroundColor: "#0f172a",
    borderRadius: "12px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    border: "1px solid #334155",
    padding: "20px",
    position: "relative",
  },
  profileHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "15px",
  },
  profileAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#3b82f6",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1rem",
    fontWeight: "600",
    border: "2px solid #60a5fa",
  },
  profileInfo: {
    textAlign: "left",
  },
  profileName: {
    margin: "0 0 2px 0",
    fontSize: "1rem",
    color: "#f1f5f9",
    fontWeight: "600",
  },
  profileTitle: {
    margin: 0,
    fontSize: "0.8rem",
    color: "#94a3b8",
    fontWeight: "400",
  },
  socialLinks: {
    display: "flex",
    gap: "15px",
    justifyContent: "center",
  },
  socialLink: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    borderRadius: "6px",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "1px solid #334155",
    transition: "all 0.3s ease",
    textDecoration: "none",
  },
  socialIcon: {
    width: "18px",
    height: "18px",
    color: "#cbd5e1",
    transition: "all 0.3s ease",
  },
  closeButton: {
    position: "absolute",
    top: "8px",
    right: "8px",
    backgroundColor: "transparent",
    color: "#94a3b8",
    border: "none",
    fontSize: "1rem",
    cursor: "pointer",
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
  },
};

// Add CSS for animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInDown {
      from {
        opacity: 0;
        transform: translate(-50%, -20px);
      }
      to {
        opacity: 1;
        transform: translate(-50%, 0);
      }
    }
    
    .nav-link:hover {
      background-color: rgba(255,255,255,0.1) !important;
    }
    
    .dev-button:hover {
      background-color: rgba(255,255,255,0.2) !important;
    }
    
    .social-link-profile:hover {
      background-color: #3b82f6 !important;
      border-color: #3b82f6 !important;
      transform: translateY(-2px) !important;
    }
    
    .social-link-profile:hover svg {
      color: white !important;
    }
    
    .close-button:hover {
      background-color: rgba(255,255,255,0.1) !important;
      color: #cbd5e1 !important;
    }
  `;
  document.head.appendChild(style);
}

export default Header;