import { createSlice } from "@reduxjs/toolkit"

const feedSlice = createSlice({
  name: "feed",
  initialState: null,
  reducers: {
    addFeed: (state, action) => {
      return action.payload
    },
    removeUserFromFeed: (state, action) => {
      const payloadId = String(action.payload);
      const newFeed = state.filter((user) => String(user._id) !== payloadId)
      return newFeed
    },
    removeFeed: () => {
      return null
    },
  },
})

export const { addFeed, removeUserFromFeed, removeFeed } = feedSlice.actions
export default feedSlice.reducer
