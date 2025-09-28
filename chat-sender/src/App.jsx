import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
 
import Login from "./login/Login";
import Home from "./home/Home";
import AChat from "./chat/Chat";
 
 
 
function App() {
   

  return (
    <>
    <BrowserRouter>
    <ToastContainer position="top-center"/>
        
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/home" element={<Home />} />
          <Route path="/chat" element={<AChat />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
     
    </>
  )
}

export default App
