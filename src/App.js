import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import Room from "./pages/Room";
import { useEffect, useState } from "react";
import { initSocket } from "./socket";

function App() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketInstance = initSocket();
    setSocket(socketInstance);

    return () => {
      if (socketInstance && socketInstance.connected) {
        console.log("Cleaning up socket...");
        socketInstance.disconnect();
      }
    };
  }, []);

  // Debugging effect
  useEffect(() => {
    if (socket) {
      console.log(
        "Socket status:",
        socket.connected ? "Connected" : "Disconnected"
      );
    }
  }, [socket]);
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          success: {
            theme: {
              primary: "#4aed88",
            },
          },
        }}
      ></Toaster>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/:roomID" element={<Room />}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
