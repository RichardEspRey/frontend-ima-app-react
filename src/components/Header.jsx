// src/components/Header.jsx
import React, { useState, useEffect } from "react";
import "./css/Header.css";

const Header = () => {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("userName");
    if (storedUser) {
      setUserName(storedUser);
    }
  }, []);

  return (
    <div className="header">
      <div className="headerIcons">
        <div className="userContainer">
          <div className="userIcon">
            <span className="userInitial">
              {userName ? userName.charAt(0).toUpperCase() : "?"}
            </span>
          </div>
          <span className="userName">{userName ? userName : "Cargando..."}</span>
        </div>
      </div>
    </div>
  );
};

export default Header;
