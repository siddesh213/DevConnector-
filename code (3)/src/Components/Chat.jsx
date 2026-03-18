import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMessage, clearCurrentChat } from "../utils/messageSlice";
import { useSocket } from "../contexts/SocketContext";
import { X, Send } from "lucide-react";

const Chat = ({ recipientUser, onClose }) => {
  const dispatch = useDispatch();
  const { socket } = useSocket();
  const currentUser = useSelector((state) => state.user);
  const messages = useSelector((state) => state.messages?.conversations || {});
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);

  // Safety check - if recipientUser is not available, render modal with error message
  if (!recipientUser) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 rounded-lg p-6 border border-red-500">
          <p className="text-red-400">❌ Error: User data not available</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 rounded-lg p-6 border border-red-500">
          <p className="text-red-400">❌ Error: Not logged in</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Get conversation ID - same as in SocketHandler (convert to strings for consistency)
  const userId1 = currentUser._id.toString();
  const userId2 = recipientUser._id.toString();
  const conversationId = [userId1, userId2].sort().join("-");
  const conversationMessages = messages[conversationId] || [];

  console.log("💬 Chat opened with:", recipientUser.FirstName);
  console.log("📊 Conversation ID:", conversationId);
  console.log("📨 Messages in conversation:", conversationMessages.length);
  console.log("📮 All conversations:", Object.keys(messages));

  // Send message (NO receiving listener here - let SocketHandler do it)
  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!messageText.trim()) return;

    if (!socket) {
      alert("❌ Not connected to server");
      return;
    }

    setLoading(true);

    console.log(`📤 Sending message:`, {
      fromUserId: currentUser._id,
      toUserId: recipientUser._id,
      message: messageText,
    });

    // Convert IDs to strings for consistency
    const fromUserId = currentUser._id.toString();
    const toUserId = recipientUser._id.toString();
    
    // Send via socket
    socket.emit("send-message", {
      fromUserId: fromUserId,
      toUserId: toUserId,
      message: messageText,
      timestamp: new Date(),
    });

    // Add to local state immediately (optimistic update)
    dispatch(
      addMessage({
        fromUserId: fromUserId,
        toUserId: toUserId,
        message: messageText,
        timestamp: new Date(),
      })
    );

    setMessageText("");
    setLoading(false);
  };

  // Auto-scroll to bottom
  useEffect(() => {
    const messagesContainer = document.getElementById("messages-container");
    if (messagesContainer) {
      setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }, 0);
    }
  }, [conversationMessages]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-lg w-full max-w-2xl h-96 flex flex-col border border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
          <div className="flex items-center gap-3">
            <img
              src={recipientUser.PhotoUrl || "/placeholder.svg"}
              alt={recipientUser.FirstName}
              className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500"
            />
            <div>
              <h3 className="font-bold text-white text-lg">
                {recipientUser.FirstName} {recipientUser.LastName}
              </h3>
              <p className="text-xs text-emerald-400">💚 Connected</p>
            </div>
          </div>
          <button
            onClick={() => {
              dispatch(clearCurrentChat());
              onClose();
            }}
            className="p-2 hover:bg-slate-700 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Messages */}
        <div
          id="messages-container"
          className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-800/50"
        >
          {conversationMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-400 text-center">
                No messages yet. Say hello! 👋
              </p>
            </div>
          ) : (
            conversationMessages.map((msg, idx) => {
              console.log(`📝 Rendering message ${idx}:`, msg);
              return (
                <div
                  key={idx}
                  className={`flex ${
                    msg.fromUserId === currentUser._id.toString()
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.fromUserId === currentUser._id.toString()
                        ? "bg-emerald-600 text-white rounded-br-none"
                        : "bg-slate-700 text-slate-100 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={handleSendMessage}
          className="p-4 border-t border-slate-700 bg-slate-800 flex gap-2"
        >
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
            className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !messageText.trim()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            {loading ? "..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
