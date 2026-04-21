import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { api } from '../../axios.config.js';

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      text: "Hello! I am your AI Assistant. How can I help you today?",
      isUser: false
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading) return;

    const userMsg = newMessage;
    setMessages((prev) => [...prev, { text: userMsg, isUser: true }]);
    setNewMessage('');
    setIsLoading(true);

    try {
      // The API call to the backend AI endpoint that handles JWT validation and querying automatically
      const response = await api.post('/ai/chat', {
        prompt: userMsg,
      });

      if (response.data && response.data.reply) {
        setMessages((prev) => [...prev, { text: response.data.reply, isUser: false }]);
      } else {
        setMessages((prev) => [...prev, { text: "Sorry, I couldn't understand that context.", isUser: false }]);
      }
    } catch (error) {
      console.error("Error communicating with AI:", error);
      setMessages((prev) => [...prev, { text: "An error occurred while fetching the response. Make sure you are authenticated.", isUser: false }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[70vh] bg-gray-900 rounded-lg shadow-xl overflow-hidden mt-4">
      {/* Header */}
      <div className="flex items-center p-4 bg-gray-800 border-b border-gray-700">
        <div className="w-8 h-8 rounded-full bg-purple-600 mr-3 flex items-center justify-center text-white text-sm">AI</div>
        <div>
          <h1 className="text-white font-medium">System AI Bot</h1>
          <p className="text-green-400 text-sm">Online</p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg flex flex-col whitespace-pre-wrap ${
                message.isUser
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-100'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-gray-800 text-gray-100 max-w-[80%] p-3 rounded-lg text-sm italic">
               Typing...
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-700">
        <div className="flex items-center bg-gray-800 rounded-lg">
          <input
            type="text"
            placeholder="Ask a question..."
            className="flex-1 bg-transparent p-3 text-white focus:outline-none"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !newMessage.trim()}
            className={`p-3 transition-colors ${isLoading || !newMessage.trim() ? "text-gray-500" : "text-purple-400 hover:text-purple-300"}`}
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
