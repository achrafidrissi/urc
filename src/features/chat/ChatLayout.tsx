// import { useState, useEffect, useRef } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useAppDispatch, useAppSelector } from "@/app/hooks";
// import {
//   fetchUsers,
//   selectUsers,
//   selectUsersStatus,
// } from "@/features/users/userSlice";
// import { selectAuthToken } from "@/features/auth/authSelectors";
// import {
//   setCurrentConversation,
//   selectCurrentConversation,
//   selectChatStatus,
//   selectChatError,
// } from "@/features/chat/chatSlice";
// import { sendMessageThunk, fetchMessagesThunk } from "./chatThunks";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { MessageCircle, Send, Users, LogOut } from "lucide-react";
// import { logout } from "@/features/auth/authSlice";
// import ChatDebug from "@/components/ChatDebug";

// export default function ChatLayout() {
//   const dispatch = useAppDispatch();
//   const navigate = useNavigate();
//   const { userId } = useParams<{ userId: string }>();
//   const token = useAppSelector(selectAuthToken);
//   const users = useAppSelector(selectUsers);
//   const status = useAppSelector(selectUsersStatus);
//   const currentConversation = useAppSelector(selectCurrentConversation);
//   const chatStatus = useAppSelector(selectChatStatus);
//   const chatError = useAppSelector(selectChatError);

//   const [message, setMessage] = useState("");
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   const currentUsername = sessionStorage.getItem("username");

//   useEffect(() => {
//     if (token) {
//       dispatch(fetchUsers(token));
//     }
//   }, [dispatch, token]);

//   useEffect(() => {
//     if (userId) {
//       const conversationId = `user_${userId}`;
//       // 1️⃣ d'abord définir la conversation active
//       dispatch(setCurrentConversation(conversationId));
//       // 2️⃣ ensuite charger les messages
//       dispatch(fetchMessagesThunk(userId));
//     }
//   }, [userId, dispatch]);

//   // Auto-scroll vers le bas quand de nouveaux messages arrivent
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [currentConversation?.messages]);

//   const handleSelectUser = (selectedUserId: string) => {
//     navigate(`/messages/user/${selectedUserId}`);
//   };

//   const handleSendMessage = () => {
//     if (message.trim() && userId) {
//       dispatch(
//         sendMessageThunk({
//           content: message.trim(),
//           recipientId: userId,
//         })
//       );
//       setMessage("");
//     }
//   };

//   const handleLogout = () => {
//     dispatch(logout());
//     navigate("/login");
//   };

//   const selectedUser = users.find((user) => user.user_id === userId);

//   return (
//     <div className="flex h-screen bg-gray-50">
//       {/* Sidebar avec liste des utilisateurs */}
//       <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
//         <div className="p-4 border-b border-gray-200">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-2">
//               <MessageCircle className="w-6 h-6 text-indigo-600" />
//               <h1 className="text-xl font-bold text-gray-900">Messages</h1>
//             </div>
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={handleLogout}
//               className="text-gray-500 hover:text-gray-700"
//             >
//               <LogOut className="w-4 h-4" />
//             </Button>
//           </div>
//         </div>

//         <div className="flex-1 overflow-y-auto">
//           <div className="p-4">
//             <div className="flex items-center space-x-2 mb-4">
//               <Users className="w-5 h-5 text-gray-500" />
//               <h2 className="font-semibold text-gray-700">Utilisateurs</h2>
//             </div>

//             {status === "loading" && (
//               <div className="text-center py-4">
//                 <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
//               </div>
//             )}

//             {status === "failed" && (
//               <div className="text-center py-4 text-red-500">
//                 Erreur de chargement
//               </div>
//             )}

//             <div className="space-y-2">
//               {users
//                 .filter((user) => user.username !== currentUsername)
//                 .map((user) => (
//                   <Button
//                     key={user.user_id}
//                     variant="ghost"
//                     onClick={() => handleSelectUser(user.user_id)}
//                     className={`w-full justify-start p-3 h-auto ${
//                       userId === user.user_id
//                         ? "bg-indigo-100 border border-indigo-200 hover:bg-indigo-100"
//                         : "hover:bg-gray-100"
//                     }`}
//                   >
//                     <div className="flex items-center space-x-3 w-full">
//                       <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
//                         {user.username.charAt(0).toUpperCase()}
//                       </div>
//                       <div className="flex-1 min-w-0 text-left">
//                         <p className="font-medium text-gray-900 truncate">
//                           {user.username}
//                         </p>
//                         <p className="text-sm text-gray-500 truncate">
//                           Dernière connexion: {user.last_login}
//                         </p>
//                       </div>
//                     </div>
//                   </Button>
//                 ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Zone de conversation */}
//       <div className="flex-1 flex flex-col">
//         {selectedUser ? (
//           <>
//             {/* Header de la conversation */}
//             <div className="bg-white border-b border-gray-200 p-4">
//               <div className="flex items-center space-x-3">
//                 <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
//                   {selectedUser.username.charAt(0).toUpperCase()}
//                 </div>
//                 <div>
//                   <h2 className="font-semibold text-gray-900">
//                     {selectedUser.username}
//                   </h2>
//                   <p className="text-sm text-gray-500">En ligne</p>
//                 </div>
//               </div>
//             </div>

//             {/* Messages */}
//             <div className="flex-1 overflow-y-auto p-4 space-y-4">
//               {chatError ? (
//                 <div className="text-center text-red-500 mt-8">
//                   <MessageCircle className="w-12 h-12 mx-auto mb-4 text-red-300" />
//                   <p>Erreur lors du chargement des messages</p>
//                   <p className="text-sm">{chatError}</p>
//                 </div>
//               ) : chatStatus === "loading" ? (
//                 <div className="text-center text-gray-500 mt-8">
//                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
//                   <p>Chargement des messages...</p>
//                 </div>
//               ) : !currentConversation ||
//                 currentConversation.messages.length === 0 ? (
//                 <div className="text-center text-gray-500 mt-8">
//                   <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
//                   <p>Aucun message pour le moment</p>
//                   <p className="text-sm">Commencez la conversation !</p>
//                 </div>
//               ) : (
//                 <>
//                   {currentConversation.messages.map((msg) => (
//                     <div
//                       key={msg.id}
//                       className={`flex ${
//                         msg.isOwn ? "justify-end" : "justify-start"
//                       }`}
//                     >
//                       <div
//                         className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
//                           msg.isOwn
//                             ? "bg-indigo-600 text-white"
//                             : "bg-white border border-gray-200 text-gray-900"
//                         }`}
//                       >
//                         <p className="text-sm">{msg.content}</p>
//                         <p
//                           className={`text-xs mt-1 ${
//                             msg.isOwn ? "text-indigo-100" : "text-gray-500"
//                           }`}
//                         >
//                           {new Date(msg.timestamp).toLocaleTimeString()}
//                         </p>
//                       </div>
//                     </div>
//                   ))}
//                   <div ref={messagesEndRef} />
//                 </>
//               )}
//             </div>

//             {/* Zone de saisie */}
//             <div className="bg-white border-t border-gray-200 p-4">
//               <div className="flex space-x-2">
//                 <Input
//                   value={message}
//                   onChange={(e) => setMessage(e.target.value)}
//                   placeholder="Tapez votre message..."
//                   onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
//                   className="flex-1"
//                 />
//                 <Button
//                   onClick={handleSendMessage}
//                   disabled={!message.trim()}
//                   className="bg-indigo-600 hover:bg-indigo-700"
//                 >
//                   <Send className="w-4 h-4" />
//                 </Button>
//               </div>
//             </div>
//           </>
//         ) : (
//           /* État vide - aucun utilisateur sélectionné */
//           <div className="flex-1 flex items-center justify-center">
//             <Card className="w-96">
//               <CardHeader className="text-center">
//                 <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
//                 <CardTitle className="text-xl text-gray-600">
//                   Sélectionnez une conversation
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="text-center">
//                 <p className="text-gray-500">
//                   Choisissez un utilisateur dans la liste pour commencer à
//                   discuter
//                 </p>
//               </CardContent>
//             </Card>
//           </div>
//         )}
//       </div>

//       {/* Composant de debug en développement */}
//       <ChatDebug />
//     </div>
//   );
// }


import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchUsers,
  selectUsers,
  selectUsersStatus,
} from "@/features/users/userSlice";
import { selectAuthToken } from "@/features/auth/authSelectors";
import {
  setCurrentConversation,
  selectCurrentConversation,
  selectChatStatus,
  selectChatError,
} from "@/features/chat/chatSlice";
import { sendMessageThunk, fetchMessagesThunk } from "./chatThunks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Users, LogOut } from "lucide-react";
import { logout } from "@/features/auth/authSlice";
import ChatDebug from "@/components/ChatDebug";

export default function ChatLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const token = useAppSelector(selectAuthToken);
  const users = useAppSelector(selectUsers);
  const usersStatus = useAppSelector(selectUsersStatus);
  const currentConversation = useAppSelector(selectCurrentConversation);
  const chatStatus = useAppSelector(selectChatStatus);
  const chatError = useAppSelector(selectChatError);

  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUsername = sessionStorage.getItem("username");

  // Charger la liste des utilisateurs
  useEffect(() => {
    if (token) dispatch(fetchUsers(token));
  }, [dispatch, token]);

  // Charger les messages quand on sélectionne un utilisateur
  useEffect(() => {
  if (userId) {
    const conversationId = `user_${String(userId)}`;
    dispatch(fetchMessagesThunk(String(userId))).then(() => {
      dispatch(setCurrentConversation(conversationId));
    });
  }
}, [userId, dispatch]);

  // Auto-scroll vers le bas quand les messages changent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentConversation?.messages]);

  const handleSelectUser = (selectedUserId: string | number) => {
  navigate(`/messages/user/${String(selectedUserId)}`);
  };

  const handleSendMessage = () => {
    if (message.trim() && userId) {
      dispatch(
        sendMessageThunk({
          content: message.trim(),
          recipientId: userId,
        })
      );
      setMessage("");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const selectedUser = users.find((u) => String(u.user_id) === String(userId));
  console.log({ userIdFromUrl: userId, usersIds: users.map(u => typeof u.user_id + ':' + u.user_id), selectedUser });

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 🔹 Barre latérale (liste des utilisateurs) */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-gray-500 hover:text-gray-700"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Users className="w-5 h-5 text-gray-500" />
            <h2 className="font-semibold text-gray-700">Utilisateurs</h2>
          </div>

          {usersStatus === "loading" && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          )}

          {usersStatus === "failed" && (
            <div className="text-center py-4 text-red-500">
              Erreur de chargement
            </div>
          )}

          <div className="space-y-2">
            {users
              .filter((u) => u.username !== currentUsername)
              .map((u) => (
                <Button
                  key={u.user_id}
                  variant="ghost"
                  onClick={() => handleSelectUser(u.user_id)}
                  className={`w-full justify-start p-3 h-auto ${
                    String(userId) === String(u.user_id)
                      ? "bg-indigo-100 border border-indigo-200 hover:bg-indigo-100"
                      : "hover:bg-gray-100"
                  }`}
                  >
                  <div className="flex items-center space-x-3 w-full">
                    <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {u.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-medium text-gray-900 truncate">
                        {u.username}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        Dernière connexion: {u.last_login}
                      </p>
                    </div>
                  </div>
                </Button>
              ))}
          </div>
        </div>
      </div>

      {/* 🔸 Zone principale (conversation) */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* En-tête de conversation */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                {selectedUser.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">
                  {selectedUser.username}
                </h2>
                <p className="text-sm text-gray-500">En ligne</p>
              </div>
            </div>

            {/* Liste de messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatError ? (
                <div className="text-center text-red-500 mt-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-red-300" />
                  <p>Erreur lors du chargement des messages</p>
                  <p className="text-sm">{chatError}</p>
                </div>
              ) : chatStatus === "loading" ? (
                <div className="text-center text-gray-500 mt-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <p>Chargement des messages...</p>
                </div>
              ) : !currentConversation ||
                currentConversation.messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucun message pour le moment</p>
                  <p className="text-sm">Commencez la conversation !</p>
                </div>
              ) : (
                <>
                  {currentConversation.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.isOwn ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.isOwn
                            ? "bg-indigo-600 text-white"
                            : "bg-white border border-gray-200 text-gray-900"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            msg.isOwn ? "text-indigo-100" : "text-gray-500"
                          }`}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Zone de saisie */}
            <div className="bg-white border-t border-gray-200 p-4 flex space-x-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tapez votre message..."
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim()}
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
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <CardTitle className="text-xl text-gray-600">
                  Sélectionnez une conversation
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-500">
                  Choisissez un utilisateur dans la liste pour commencer à
                  discuter
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* 🔍 Composant debug (facultatif) */}
      <ChatDebug />
    </div>
  );
}
