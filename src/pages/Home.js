import React, { useState } from "react";
import { v4 } from "uuid";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const [roomID, setRoomID] = useState("");

  const createRoom = (e) => {
    e.preventDefault();
    setRoomID(v4());
    toast.success("New Room Created");
  };

  const joinRoom = () => {
    if (!roomID) {
      toast.error("secret-room is required");
      return;
    }

    navigate(`/${roomID}`);
  };

  const handleInputEnter = (e) => {
    // console.log(e);
    if (e.code === "Enter") {
      joinRoom();
    }
  };

  return (
    <>
      <div className="homePageWrapper">
        <div className="intro">
          <h1 className="introHeading">LIVEPAD</h1>
          <h2 className="introSubHeading">
            No More &#8216;Can You See My Screen?&#8217;
          </h2>
        </div>
        <div className="inputGroup">
          <h4 className="inputDomain">livepad.dev/</h4>
          <input
            type="text"
            value={roomID}
            placeholder="your-secret-room"
            onChange={(e) => setRoomID(e.target.value)}
            onKeyUp={handleInputEnter}
            className="inputBox"
          />
          <button className="inputGo" onClick={joinRoom}>
            Go!
          </button>
          <button className="inputCreateRoom" onClick={createRoom}>
            Create Room!
          </button>
        </div>
      </div>
      <div className="footer">
        <p>LivePad® — Because ‘Can You See My Screen?’ is So 2023</p>
        <p>
          Made with <span>♥</span> by{" "}
          <a href="https://kashish-naresh.github.io/KashishPortfolio/">
            Kashish Naresh
          </a>
        </p>
      </div>
    </>
  );
}

export default Home;
