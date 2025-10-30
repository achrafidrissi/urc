import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import userReducer from "@/features/users/userSlice";
import chatReducer from "@/features/chat/chatSlice";
import roomsReducer from "@/features/rooms/roomsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    chat: chatReducer,
    rooms: roomsReducer,
  },
});

// Types inferés du store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
