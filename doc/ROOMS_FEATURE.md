# 🏠 Fonctionnalité Salons de Discussion

## 📋 Vue d'ensemble

Cette fonctionnalité ajoute la possibilité de créer et participer à des **salons de discussion** (group chats) en plus des messages privés existants.

## 🧩 Backend (Node.js / Express sur Vercel)

### Endpoints créés

#### 1. `/api/rooms`

- **GET** : Récupère la liste de tous les salons
- **POST** : Crée un nouveau salon (nom + description optionnelle)

#### 2. `/api/rooms/[roomId]/messages`

- **GET** : Récupère tous les messages d'un salon triés par date croissante
- **POST** : Ajoute un message dans le salon

### Stockage Redis

Les données sont stockées dans Upstash Redis avec les clés suivantes :

```
rooms:list                    # Liste de tous les salons
rooms:<roomId>:messages       # Messages d'un salon spécifique
```

### Structure des données

**Salon :**

```json
{
  "id": "room_1234567890_abc123",
  "name": "Nom du salon",
  "description": "Description optionnelle",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "createdBy": "user_id",
  "createdByUsername": "username"
}
```

**Message de salon :**

```json
{
  "id": "msg_1234567890_def456",
  "sender": "username",
  "senderId": "user_id",
  "content": "Contenu du message",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "roomId": "room_1234567890_abc123"
}
```

## 💻 Frontend (React + Redux Toolkit)

### Nouveaux fichiers créés

1. **`src/features/rooms/roomsSlice.ts`** - Slice Redux pour gérer l'état des salons
2. **`src/features/rooms/RoomsLayout.tsx`** - Interface principale des salons
3. **`src/features/rooms/RoomsPage.tsx`** - Page wrapper pour les salons

### Fonctionnalités

- ✅ Liste des salons disponibles
- ✅ Création de nouveaux salons
- ✅ Affichage des messages d'un salon
- ✅ Envoi de messages dans un salon
- ✅ Navigation entre messages privés et salons
- ✅ Design cohérent avec l'existant
- ✅ Scroll automatique vers le bas
- ✅ Gestion des erreurs

### Routes ajoutées

- `/rooms` - Page des salons (liste)
- `/rooms/:roomId` - Conversation d'un salon spécifique

## 🚀 Utilisation

1. **Accéder aux salons** : Cliquez sur l'icône 💬 dans la barre de navigation des messages privés
2. **Créer un salon** : Cliquez sur le bouton ➕ dans la barre des salons
3. **Rejoindre un salon** : Cliquez sur un salon dans la liste
4. **Envoyer un message** : Tapez dans le champ de saisie et appuyez sur Entrée ou cliquez sur Envoyer
5. **Retourner aux messages privés** : Cliquez sur l'icône 💬 dans la barre des salons

## 🔧 Configuration

Aucune configuration supplémentaire n'est requise. La fonctionnalité utilise :

- Les mêmes tokens JWT pour l'authentification
- La même base Redis Upstash
- Le même système de routing React Router
- Le même store Redux existant

## 📝 Notes techniques

- Les messages sont triés par timestamp croissant (plus anciens en premier)
- Chaque salon a un ID unique généré avec timestamp + random
- Les messages affichent le nom de l'expéditeur pour les autres utilisateurs
- Le design réutilise les composants UI existants (Button, Card, Input, etc.)
- La navigation entre les deux modes est fluide avec des boutons dédiés
