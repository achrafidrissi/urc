import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchRoomsThunk,
  createRoomThunk,
  fetchRoomMessagesThunk,
  sendRoomMessageThunk,
  selectRooms,
  selectCurrentRoom,
  selectRoomMessages,
  selectRoomsStatus,
  selectRoomsError,
  setCurrentRoom,
  Room,
  RoomMessage,
} from "@/features/rooms/roomsSlice";
import { selectAuthToken } from "@/features/auth/authSelectors";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MessageSquare,
  Send,
  Users,
  LogOut,
  Plus,
  Hash,
  Calendar,
  MessageCircle,
} from "lucide-react";
import { logout } from "@/features/auth/authSlice";

export default function RoomsLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const token = useAppSelector(selectAuthToken);
  const rooms = useAppSelector(selectRooms);
  const currentRoom = useAppSelector(selectCurrentRoom);
  const messages = useAppSelector(selectRoomMessages);
  const roomsStatus = useAppSelector(selectRoomsStatus);
  const roomsError = useAppSelector(selectRoomsError);

  const [message, setMessage] = useState("");
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDescription, setNewRoomDescription] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUsername = sessionStorage.getItem("username");

  // Charger la liste des salons
  useEffect(() => {
    if (token) {
      dispatch(fetchRoomsThunk());
    }
  }, [dispatch, token]);

  // Charger les messages quand on sélectionne un salon
  useEffect(() => {
    if (roomId) {
      const selectedRoom = rooms.find((r) => r.id === roomId);
      if (selectedRoom) {
        dispatch(setCurrentRoom(selectedRoom));
        dispatch(fetchRoomMessagesThunk(roomId));
      }
    }
  }, [roomId, rooms, dispatch]);

  // Scroll automatique vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectRoom = (selectedRoomId: string) => {
    navigate(`/rooms/${selectedRoomId}`);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !roomId) return;

    const content = message.trim();
    setMessage("");

    dispatch(sendRoomMessageThunk({ roomId, content }));
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;

    try {
      await dispatch(
        createRoomThunk({
          name: newRoomName.trim(),
          description: newRoomDescription.trim(),
        })
      ).unwrap();

      setNewRoomName("");
      setNewRoomDescription("");
      setShowCreateRoom(false);
    } catch (error) {
      console.error("Erreur lors de la création du salon:", error);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const selectedRoom = rooms.find((r) => r.id === roomId);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 🔹 Barre latérale (liste des salons) */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-gray-900">Salons</h1>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="text-gray-500 hover:text-gray-700"
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCreateRoom(!showCreateRoom)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Formulaire de création de salon */}
        {showCreateRoom && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Nouveau salon</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="roomName" className="text-xs">
                    Nom du salon
                  </Label>
                  <Input
                    id="roomName"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="Nom du salon..."
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="roomDescription" className="text-xs">
                    Description (optionnel)
                  </Label>
                  <Input
                    id="roomDescription"
                    value={newRoomDescription}
                    onChange={(e) => setNewRoomDescription(e.target.value)}
                    placeholder="Description..."
                    className="text-sm"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleCreateRoom}
                    size="sm"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                    disabled={!newRoomName.trim()}
                  >
                    Créer
                  </Button>
                  <Button
                    onClick={() => setShowCreateRoom(false)}
                    variant="outline"
                    size="sm"
                  >
                    Annuler
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Hash className="w-5 h-5 text-gray-500" />
            <h2 className="font-semibold text-gray-700">Salons disponibles</h2>
          </div>

          {roomsStatus === "loading" && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          )}

          {roomsStatus === "failed" && (
            <div className="text-center py-4 text-red-500">
              Erreur de chargement
            </div>
          )}

          <div className="space-y-2">
            {rooms.map((room) => (
              <Button
                key={room.id}
                variant="ghost"
                onClick={() => handleSelectRoom(room.id)}
                className={`w-full justify-start p-3 h-auto ${
                  roomId === room.id
                    ? "bg-indigo-100 border border-indigo-200 hover:bg-indigo-100"
                    : "hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center space-x-3 w-full">
                  <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {room.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-medium text-gray-900 truncate">
                      {room.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {room.description || "Aucune description"}
                    </p>
                    <p className="text-xs text-gray-400">
                      Créé par {room.createdByUsername}
                    </p>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* 🔸 Zone principale (conversation du salon) */}
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            {/* En-tête de conversation */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                {selectedRoom.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">
                  {selectedRoom.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedRoom.description || "Salon de discussion"}
                </p>
              </div>
            </div>

            {/* Liste de messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {roomsError ? (
                <div className="text-center text-red-500 mt-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-red-300" />
                  <p>Erreur lors du chargement des messages</p>
                  <p className="text-sm">{roomsError}</p>
                </div>
              ) : roomsStatus === "loading" ? (
                <div className="text-center text-gray-500 mt-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <p>Chargement des messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucun message dans ce salon</p>
                  <p className="text-sm">Soyez le premier à écrire !</p>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-4">
                    {messages.map((msg: RoomMessage) => {
                      const isOwn = msg.sender === currentUsername;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${
                            isOwn ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isOwn
                                ? "bg-indigo-600 text-white"
                                : "bg-white border border-gray-200 text-gray-900"
                            }`}
                          >
                            {!isOwn && (
                              <p className="text-xs font-medium mb-1 opacity-75">
                                {msg.sender}
                              </p>
                            )}
                            <p className="text-sm">{msg.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                isOwn ? "text-indigo-100" : "text-gray-500"
                              }`}
                            >
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </>
              )}
            </div>

            {/* Zone de saisie */}
            <div className="bg-white border-t border-gray-200 p-4 flex space-x-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Écrire dans ${selectedRoom.name}...`}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <Card className="w-96">
              <CardHeader className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <CardTitle className="text-xl text-gray-600">
                  Sélectionnez un salon
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-500">
                  Choisissez un salon dans la liste pour commencer à discuter
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
