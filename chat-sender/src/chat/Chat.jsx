import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ref as dbRef, onValue, update, get } from "firebase/database";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, arrayUnion, Timestamp, getDoc, onSnapshot } from "firebase/firestore"; // Add these imports 
import { database, storage, db } from "../firebase";
import { toast } from "react-toastify";
import "./chat.css";

const AChat = () => {
  const endRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const username = location.state?.username;
  const [userData, setUserData] = useState(null);
  const [banStatus, setBanStatus] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!username) {
      toast.error("No user data found. Redirecting to Login.", { autoClose: 1500 });
      navigate("/login");
      return;
    }

    const userRef = dbRef(database, `chat-sender/${username}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        setUserData(snapshot.val());
        setBanStatus(snapshot.val().ban);
      } else {
        toast.error("User data not found.", { autoClose: 1500 });
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, [username, navigate]);

  // Load messages from Firestore
  useEffect(() => {
    if (!username) return;

    const userDocRef = doc(db, "chat-sender", username);
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.messages) {
          setMessages(data.messages);
        } else {
          setMessages([]);
        }
        setLoading(false);
      } else {
        setMessages([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [username]);

   const renderStatus = () => {
    if (banStatus === 1) {
      return <p className="status verified">Verified</p>;
    } else if (banStatus === 9) {
      return <p className="status blocked">Blocked</p>;
    } else {
      return <p className="status unknown">No Status Available</p>;
    }
  }; 

    
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Upload Image to Firebase Storage
    const timestamp = new Date().getTime();
    const fileRef = ref(storage, `chat-sender/${username}/images/${timestamp}_${file.name}`);
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Optional: Handle progress updates
      },
      (error) => {
        console.error("Error uploading file:", error);
        toast.error("Error uploading image. Please try again.", { autoClose: 1500 });
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        toast.success("Image uploaded successfully!", { autoClose: 1500 });
        console.log("Image available at", downloadURL);

        try {
          // Fetch user data from Realtime Database
          const userRef = dbRef(database, `chat-sender/${username}`);
          const snapshot = await get(userRef);
          if (!snapshot.exists()) {
            toast.error("User data not found.", { autoClose: 1500 });
            return;
          }

          const latestUserData = snapshot.val();
          const newUnseen = latestUserData.unseen + 1;

          // Update Realtime Database with new unseen value
          await update(userRef, {
            unseen: newUnseen,
          });

          // Save Image URL to Firestore
          const userDocRef = doc(db, `chat-sender`, username);
          await updateDoc(userDocRef, {
            messages: arrayUnion({
              url: downloadURL,
              sender: 1, 
              type: "image",
              timestamp: Timestamp.now(),
              
            })
          });

          toast.success("Image sent successfully!", { autoClose: 1500 });
        } catch (error) {
          console.error("Error saving image:", error);
          toast.error("Error saving image. Please try again.", { autoClose: 1500 });
        }
      }
    );
  };
  

 

  const handleVideoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const timestamp = new Date().getTime();
    const fileRef = ref(storage, `chat-sender/${username}/videos/${timestamp}_${file.name}`);
    const uploadTask = uploadBytesResumable(fileRef, file);
  
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Optional: Handle progress updates
      },
      (error) => {
        console.error("Error uploading file:", error);
        toast.error("Error uploading video. Please try again.", { autoClose: 1500 });
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        toast.success("Video uploaded successfully!", { autoClose: 1500 });
        console.log("Video available at", downloadURL);
  
        try {
          // Fetch user data from Realtime Database
          const userRef = dbRef(database, `chat-sender/${username}`);
          const snapshot = await get(userRef);
          if (!snapshot.exists()) {
            toast.error("User data not found.", { autoClose: 1500 });
            return;
          }
  
          const latestUserData = snapshot.val();
          const newUnseen = latestUserData.unseen + 2;
  
          // Update Realtime Database with new unseen value
          await update(userRef, {
            unseen: newUnseen,
          });
  
          // Save Video URL to Firestore
          const userDocRef = doc(db, `chat-sender`, username);
          await updateDoc(userDocRef, {
            messages: arrayUnion({
              url: downloadURL,
              sender: 1,  
              type: "video",  
              timestamp: Timestamp.now(),
              
            })
          });
  
          toast.success("Video URL saved successfully!", { autoClose: 1500 });
        } catch (error) {
          console.error("Error saving video URL:", error);
          toast.error("Error saving video URL. Please try again.", { autoClose: 1500 });
        }
      }
    );
  };

   

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Function to render messages
  const renderMessage = (message, index) => {
    const isOwn = message.sender === 1; // 1 means sender, 0 means receiver
    const messageClass = isOwn ? "messege own" : "messege";
    
    // Format timestamp
    const formatTime = (timestamp) => {
      if (timestamp && timestamp.toDate) {
        return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return "now";
    };

    return (
      <div key={index} className={messageClass}>
        <div className={isOwn ? "texts" : "text"}>
          {message.type === "image" ? (
            <div>
              <img 
                src={message.url} 
                alt="Uploaded image" 
                style={{ 
                  maxWidth: "500px", 
                  maxHeight: "600px", 
                  width: "100%",
                  height: "auto",
                  borderRadius: "10px",
                  objectFit: "cover",
                  cursor: "pointer"
                }} 
                onClick={() => window.open(message.url, '_blank')}
              />
              <p style={{ marginTop: "5px", fontSize: "12px", color: "#666" }}>
                Image sent
              </p>
            </div>
          ) : message.type === "video" ? (
            <div>
              <video 
                src={message.url} 
                controls 
                style={{ 
                  maxWidth: "500px", 
                  maxHeight: "600px", 
                  width: "100%",
                  height: "auto",
                  borderRadius: "10px"
                }}
              />
              <p style={{ marginTop: "5px", fontSize: "12px", color: "#666" }}>
                Video sent
              </p>
            </div>
          ) : (
            <p>{message.text || "Message"}</p>
          )}
          <span>{formatTime(message.timestamp)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="chat-container">
      <div className="chat-section">
        <div className="chat-header">
          <div className="user-info">
            <label className="chat-receiver" htmlFor="receiver"> {userData?.receiver || "N/A"}</label>
          </div>

           <div className="action-buttons">
            {renderStatus()}
          </div>
          
        </div>


// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1111


        {/* Center Section - Dynamic Messages */}
        <div className="center">
          {loading ? (
            <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
              No messages yet. Upload an image or video to start the conversation!
            </div>
          ) : (
            messages.map((message, index) => renderMessage(message, index))
          )}
          <div ref={endRef}></div>
        </div>

// ____________________________________________________________________________________________________________________________________





        

        <div className="chat-footer">
          <div className="footer-icons">
            
            <input type="file" id="videoUpload" style={{ display: "none" }} accept="video/*" onChange={handleVideoUpload} />
            <label htmlFor="videoUpload">
              <img src="./video.png" alt="Video" style={{ cursor: "pointer" }} />
            </label>

            <input type="file" id="imageUpload" style={{ display: "none" }} accept="image/*" onChange={handleImageUpload} />
            <label htmlFor="imageUpload">
              <img src="./img.png" alt="Image" style={{ cursor: "pointer" }} />
            </label>
            
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default AChat;
