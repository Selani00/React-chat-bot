import { useState } from "react";
import { config } from 'dotenv';

import "./App.css";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";

config();

function App() {
  
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    { message: "Hello, how can I help you?", sender: "ChatGPT" },
  ]);

  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing",
    };

    const newMessages = [...messages, newMessage]; //all the new msg + old msg

    //Update our message state

    setMessages(newMessages);

    // typing indicator
    setIsTyping(true);

    //process message to chatbot

    await processMessage(newMessages);
  };

  async function processMessage(chatMessages) {
    // chatMessages { sender : "user" or "ChatGPT", message: "message" }
    //apiMessages { sender : "user" or "assistant", content: "message" }
    

    let apiMessages = chatMessages.map((messageObject) => {
      let role = ""; 
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }

      return {
        role: role,
        content: messageObject.message,
      };
    });

    // role : "user" -> a message from the user, "assistant" -> a response from chatGPT
    // "system" -> genarally one initial message defining HOW we want chatGpt to talk

    const systemMessage = {
      role: "system",
      content: "Explain all concepts like I am 10 years old.",// How the actual language model should talk
    };
    

    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,
        ...apiMessages // [message1 ,msg2, msg3]
      ]
    }

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + process.env.API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(apiRequestBody),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log(data);
      console.log(data.choices[0].message.content);
      setMessages(
        [...chatMessages,{
          message: data.choices[0].message.content,
          sender: "ChatGPT",
        }]
      );
      setIsTyping(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  return (
    
    <div>
      <div className="relevant p-5 ">
        <MainContainer>
          <ChatContainer>
            <MessageList
            scrollBehavior="smooth"
              typingIndicator={
                isTyping ? <TypingIndicator content="Typing" /> : null
              }
            >
              {messages.map((message, index) => {
                return <Message key={index} model={message} />;
              })}
            </MessageList>

            <MessageInput placeholder="Type message here" onSend={handleSend} />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}

export default App;
