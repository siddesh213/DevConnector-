import { createSlice } from "@reduxjs/toolkit";

// Helper function to generate consistent conversation ID
const getConversationId = (userId1, userId2) => {
  return [userId1, userId2].sort().join("-");
};

const messageSlice = createSlice({
  name: "messages",
  initialState: {
    // Format: { [conversationId]: [{ fromUserId, toUserId, message, timestamp }, ...] }
    conversations: {},
    currentChat: null, // Currently open chat with user ID
  },
  reducers: {
    addMessage: (state, action) => {
      const { fromUserId, toUserId, message, timestamp } = action.payload;
      
      // Generate consistent conversation ID
      const conversationId = getConversationId(fromUserId, toUserId);

      console.log(`💾 Adding message to conversation: ${conversationId}`);
      console.log(`   From: ${fromUserId}, To: ${toUserId}`);
      console.log(`   Message: "${message}"`);

      if (!state.conversations[conversationId]) {
        state.conversations[conversationId] = [];
        console.log(`   ✅ Created new conversation: ${conversationId}`);
      }

      state.conversations[conversationId].push({
        fromUserId,
        toUserId,
        message,
        timestamp: timestamp || new Date().toISOString(),
      });

      console.log(`   📊 Total messages in conversation: ${state.conversations[conversationId].length}`);
    },

    setCurrentChat: (state, action) => {
      state.currentChat = action.payload;
    },

    clearCurrentChat: (state) => {
      state.currentChat = null;
    },

    getMessages: (state, action) => {
      const { userId1, userId2 } = action.payload;
      const conversationId = getConversationId(userId1, userId2);
      return state.conversations[conversationId] || [];
    },
  },
});

export const { addMessage, setCurrentChat, clearCurrentChat, getMessages } =
  messageSlice.actions;
export default messageSlice.reducer;
