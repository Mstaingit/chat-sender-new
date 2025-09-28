import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaBars } from "react-icons/fa6";

import "./home.css";

function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const username = location.state?.username || "Unknown";

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  
  const handleChat = () => {
    navigate("/chat", { state: { username } });
  };


  
  return (
    <>
      <header className="home-nav-hd">
        <div className="home-nav-container">
          <nav className="home-navv">
            <ul className={`home-nav-link ${isMenuOpen ? "home-open" : ""}`}>
              <li>
                <a href="/home" className="home-nav-active">
                  Home
                </a>
              </li>

              
              <li>
                <a onClick={handleChat}>
                  Chat
                </a>
              </li>
              
               
            </ul>
            <div className="home-nav-icon" onClick={toggleMenu} aria-label="Toggle menu">
              <FaBars />
            </div>
          </nav>
        </div>
      </header>

      <div class=" bodyy">
     


     <p> Home</p>

    
     


    

    
</div>

    </>
  );
}

export default Home;
