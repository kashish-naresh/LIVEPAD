import React, { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { initSocket } from "../socket.js";
import Writer from "../components/Writer.js";
import "../Room.css";

function Room() {
  const socketRef = useRef(null);
  const editorRef = useRef(null);
  const { roomID } = useParams();
  const navigate = useNavigate();
  const reactNavigator = useNavigate();

  useEffect(() => {
    const handleError = (e) => {
      console.error("Socket error", e);
      toast.error("Socket connection failed");
      navigate("/");
    };

    const init = async () => {
      const socket = await initSocket();

      if (!socketRef.current) {
        socketRef.current = socket;

        socket.on("connect_error", handleError);
        socket.on("connect_failed", handleError);

        socket.emit("join", { roomID });

        socket.on("joined", ({ socketID }) => {
          if (socketID !== socket.id && editorRef.current?.getValue) {
            socket.emit("sync_code", {
              code: editorRef.current.getValue(),
              socketID,
            });
          }
        });
      }
    };

    init();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [roomID]);

  useEffect(() => {
    if (socketRef.current) {
      const socket = socketRef.current;

      const listeners = {
        connect: () => console.log("Connected"),
        disconnect: () => console.log("Disconnected"),
        reconnect: (attempt) => console.log("Reconnected attempt", attempt),
        error: (err) => console.error("Socket error", err),
      };

      Object.entries(listeners).forEach(([event, handler]) => {
        socket.on(event, handler);
      });

      return () => {
        Object.entries(listeners).forEach(([event, handler]) => {
          socket.off(event, handler);
        });
      };
    }
  }, [socketRef.current]);

  async function copyUrl() {
    try {
      const currentUrl = window.location.href; // Get the full URL of the current page
      await navigator.clipboard.writeText(currentUrl); // Copy the URL to clipboard
      toast.success("URL has been copied to your clipboard");
    } catch (err) {
      toast.error("Could not copy the URL");
      console.error(err);
    }
  }

  function leaveRoom() {
    reactNavigator("/");
  }

  return (
    <div className="mainWrap">
      <Writer socketRef={socketRef} roomID={roomID} editorRefProp={editorRef} />
      <div className="button-container">
        <button className="btn copyBtn" onClick={copyUrl}>
          Copy URL
        </button>
        <button className="btn leaveBtn" onClick={leaveRoom}>
          Leave
        </button>
      </div>
    </div>
  );
}

export default Room;
