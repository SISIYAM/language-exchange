import { useState } from "react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";

const API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

const systemMessage = {
  role: "system",
  content:
    "You are a helpful language tutor teaching different languages. Help the user with their language learning journey.",
};

function App() {
  const [messages, setMessages] = useState([
    {
      message: "Ask Enlighten Anything!",
      sender: "ChatGPT",
      direction: "incoming",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (message) => {
    const newMessage = {
      message,
      sender: "user",
      direction: "outgoing", // User messages on the right
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);

    setIsTyping(true);
    await processMessageToChatGPT([...messages, newMessage]);
  };

  async function processMessageToChatGPT(chatMessages) {
    let apiMessages = chatMessages.map((msg) => ({
      role: msg.sender === "ChatGPT" ? "assistant" : "user",
      content: msg.message,
    }));

    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [systemMessage, ...apiMessages],
    };

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiRequestBody),
        }
      );

      const data = await response.json();

      if (data.choices && data.choices.length > 0) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            message: data.choices[0].message.content,
            sender: "ChatGPT",
            direction: "incoming", // ChatGPT messages on the left
          },
        ]);
      }
    } catch (error) {
      console.error("Error:", error);
    }

    setIsTyping(false);
  }

  return (
    <div className="App">
      <div style={{ position: "relative", height: "600px" }}>
        <MainContainer>
          <ChatContainer>
            <MessageList
              scrollBehavior="smooth"
              typingIndicator={
                isTyping ? (
                  <TypingIndicator content="Enlighten is typing..." />
                ) : null
              }
            >
              {messages.map((msg, index) => (
                <Message key={index} model={msg} />
              ))}
            </MessageList>
            <MessageInput
              placeholder="Type message here..."
              onSend={handleSend}
            />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}

export default App;
