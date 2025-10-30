import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";

// 🏠 Types pour les salons
export interface Room {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  createdBy: string;
  createdByUsername: string;
}

// 💬 Types pour les messages de salon
export interface RoomMessage {
  id: string;
  sender: string;
  senderId: string;
  content: string;
  timestamp: string;
  roomId: string;
}

// 📊 État des salons
interface RoomsState {
  rooms: Room[];
  currentRoom: Room | null;
  messages: RoomMessage[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: RoomsState = {
  rooms: [],
  currentRoom: null,
  messages: [],
  status: "idle",
  error: null,
};

// 🔄 Thunks pour les appels API
export const fetchRoomsThunk = createAsyncThunk(
  "rooms/fetchRooms",
  async (_, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("Token manquant");

      const response = await fetch("/api/rooms", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.rooms;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createRoomThunk = createAsyncThunk(
  "rooms/createRoom",
  async (
    { name, description }: { name: string; description?: string },
    { rejectWithValue }
  ) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("Token manquant");

      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.room;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchRoomMessagesThunk = createAsyncThunk(
  "rooms/fetchRoomMessages",
  async (roomId: string, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("Token manquant");

      const response = await fetch(`/api/rooms/${roomId}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { roomId, messages: data.messages };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const sendRoomMessageThunk = createAsyncThunk(
  "rooms/sendRoomMessage",
  async (
    { roomId, content }: { roomId: string; content: string },
    { rejectWithValue }
  ) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("Token manquant");

      const response = await fetch(`/api/rooms/${roomId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.message;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 🎯 Slice Redux
const roomsSlice = createSlice({
  name: "rooms",
  initialState,
  reducers: {
    setCurrentRoom(state, action: PayloadAction<Room | null>) {
      state.currentRoom = action.payload;
    },
    clearRoomsError(state) {
      state.error = null;
    },
    appendRoomMessage(state, action: PayloadAction<RoomMessage>) {
      state.messages.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // 📋 Récupération des salons
      .addCase(fetchRoomsThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchRoomsThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.rooms = action.payload;
      })
      .addCase(fetchRoomsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // 🆕 Création d'un salon
      .addCase(createRoomThunk.fulfilled, (state, action) => {
        state.rooms.unshift(action.payload);
      })

      // 💬 Messages du salon
      .addCase(fetchRoomMessagesThunk.fulfilled, (state, action) => {
        const { roomId, messages } = action.payload;
        state.messages = messages;
      })
      .addCase(sendRoomMessageThunk.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      });
  },
});

export const { setCurrentRoom, clearRoomsError, appendRoomMessage } =
  roomsSlice.actions;

// 🔍 Sélecteurs
export const selectRooms = (state: any) => state.rooms.rooms;
export const selectCurrentRoom = (state: any) => state.rooms.currentRoom;
export const selectRoomMessages = (state: any) => state.rooms.messages;
export const selectRoomsStatus = (state: any) => state.rooms.status;
export const selectRoomsError = (state: any) => state.rooms.error;

export default roomsSlice.reducer;
