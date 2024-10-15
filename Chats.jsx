import React, { useEffect, useRef, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import ACTIONS from "../../Actions";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import { motion } from "framer-motion";
import "./Chats.css"; 
import NotificationMessage from "../../pages/Assets/Notification/Notification-Message.mp3";
import preventHorizontalScroll from "../../preventHorizontalScroll";

const Chat = ({ socket, roomId, userName, setShowChat, isVisible }) => {
  useEffect(() => {
    preventHorizontalScroll(); 
  }, []);

  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: roomId,
        author: userName,
        message: currentMessage,
        time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
      };

      await socket.emit(ACTIONS.SEND_MESSAGE, messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on(ACTIONS.RECEIVE_MESSAGE, (data) => {
        setMessageList((list) => [...list, data]);
        const audio = new Audio(NotificationMessage);
        audio.volume = 0.1; // Set the volume to 10%
        audio.play();
      });
    }
  }, [socket]);

  useEffect(() => {
    scrollToBottom(); // Scroll to bottom on initial render
  }, [messageList]); // Update scroll to bottom when messages change

  return (
    <motion.div className={`${isVisible ? "visible" : "hidden"}`}>
      <div className="flex flex-col absolute z-50 right-[2%] top-[5%] w-auto min-w-[27%] max-w-[27%] h-[84%] flex-shrink-0 rounded-2xl bg-White shadow-xl shadow-black">
        <div className="p-6 pr-3 pb-1 pl-5 flex">
          <span className="font-Roboto text-base font-medium leading-normal ml-1">In-room messages</span>
          <CloseIcon className="ml-auto cursor-pointer scale-120 mr-2" onClick={() => setShowChat(false)} />
        </div>
        <div className="flex w-full py-4 px-4 justify-between items-center">
          <div className="flex flex-col w-full h-10 justify-center items-center rounded bg-ChatBg">
            <span className="flex items-center font-Roboto text-sm xl:text-sm font-normal">Main Meet Messages</span>
          </div>
        </div>
        <div className="w-full chat-body no-scrollbar flex overflow-hidden relative">
          <ScrollToBottom className="scrollToBottom w-full h-full no-scrollbar custom-scrollbar text-sm font-Roboto mt-6 font-normal">
            <div className="app-message">
              <div className="flex px-1 py-2 gap-5 rounded-4 xl:w-52 mb-0.5 justify-center w-full">
                <span className="text-center text-ChatText font-Roboto text-xs xl:text-xs font-Normal w-[75%]">
                  Messages can only be seen by people in the call and are deleted when the call ends.
                </span>
              </div>
            </div>

            {messageList.map((messageContent, index) => {
              return (
                <div className="flex justify-end" key={index}>
                  <div
                    className={`chat-message ${
                      userName === messageContent.author ? "you" : "other"
                    }`}
                  >
                    <div className="message-content">
                      <p>{messageContent.message}</p>
                    </div>
                  </div>
                  <div ref={messagesEndRef} />
                </div>
              );
            })}
          </ScrollToBottom>
        </div>
        <div className="flex items-center relative w-[95%] mb-3 h-14 bg-gray-50 rounded-3xl bg-[#F1F3F4] mx-auto">
          <input
            type="text"
            className="w-full h-full border-none outline-none px-4 py-3 mt-2 mb-2 text-base font-roboto font-normal bg-transparent"
            value={currentMessage}
            placeholder="Send a message to everyone"
            onChange={(event) => {
              setCurrentMessage(event.target.value);
            }}
            onKeyPress={(event) => {
              event.key === "Enter" && sendMessage();
            }}
          />
          <SendIcon onClick={sendMessage} className="mx-2" />
        </div>
      </div>
    </motion.div>
  );
};

export default Chat;
