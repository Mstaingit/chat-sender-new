import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, get, child } from "firebase/database";
import { db, database } from "../firebase"; //// Ensure correct path
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./login.css";

// Initial state
const initialState = {
  username: "",
  pass: "",
};

function Login() {
  const [state, setState] = useState(initialState);
  const { username, pass } = state;
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setState({ ...state, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !pass) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      // Reference to the "sender" path in the database
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, `chat-sender/${username}`));

      if (snapshot.exists() && snapshot.val().pass === pass) {
        // User exists, navigate to home page and pass managername as state
        toast.success("Login successful!", { autoClose: 1500 });
        navigate("/home", { state: { username } });
      } else {
        // User does not exist
        toast.error("Invalid username or password", { autoClose: 1500 });
      }
    } catch (error) {
      console.error("Error logging in:", error);
      toast.error("An error occurred. Please try again later.", { autoClose: 1500 });
    }
  };

  return (
    <div>
      <div style={{ marginTop: "100px" }}>
        <form
          style={{
            margin: "auto",
            padding: "15px",
            maxWidth: "400px",
            alignContent: "center",
          }}
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            name="username"
            id="username"
            placeholder="username..."
            value={username}
            onChange={handleInputChange}
          />
          <br />

          <input
            type="text"
            name="pass"
            id="pass"
            placeholder="Password..."
            value={pass}
            onChange={handleInputChange}
          />
          <br />

          <input type="submit" value="Login" />

           
          
        </form>
      </div>
    </div>
  );
}

export default Login;
