import React, { useEffect, useRef } from "react";
import CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
// import ACTIONS from "../Actions.js";
const Writer = ({ socketRef, roomID, editorRefProp }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) {
      const editor = CodeMirror.fromTextArea(
        document.getElementById("realtimeEditor"),
        {
          mode: { name: "javascript", json: true },
          theme: "idea",
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
          value: localStorage.getItem(roomID) || "", // Load saved code
        }
      );

      editorRef.current = editor;
      if (editorRefProp) editorRefProp.current = editor;

      editor.on("change", (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();
        localStorage.setItem(roomID, code);

        if (origin !== "setValue") {
          socketRef.current?.emit("code_change", {
            // Consistent event naming
            roomID,
            code,
          });
        }
      });
    }
  }, [roomID]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleCodeChange = ({ code }) => {
      if (code !== null && editorRef.current) {
        editorRef.current.setValue(code);
      }
    };

    socket.on("code_change", handleCodeChange);
    socket.on("sync_code", handleCodeChange);

    return () => {
      socket.off("code_change", handleCodeChange);
      socket.off("sync_code", handleCodeChange);
    };
  }, [socketRef.current]);

  return <textarea id="realtimeEditor"></textarea>;
};
export default Writer;
