import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ref as dbRef, onValue, update, get } from "firebase/database";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, arrayUnion, Timestamp } from "firebase/firestore"; // Add these imports 
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
  
// __________________________________________________________________________________________________________________________________  

   

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

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


        {/* Center Section Left Untouched */}
        <div className="center">
          <div className="messege">
            <div className="text">
              <p>hello sender</p>
              <span>15 min ago</span>
            </div>
          </div>

          <div className="messege own">
            <div className="texts">
              <p>hi receiver</p>
              <span>13 min ago</span>
            </div>
          </div>

          <div className="messege">
            <div className="text">
              <p>how are you</p>
              <span>11 min ago</span>
            </div>
          </div>

          <div className="messege own">
            <div className="texts">
              <p>i am good how are you</p>
              <span>9 min ago</span>
            </div>
          </div>

          <div className="messege">
            <div className="text">
              <p>i am ok</p>
              <span>1 min ago</span>
            </div>
          </div>

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
