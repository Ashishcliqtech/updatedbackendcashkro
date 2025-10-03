# Chat API Documentation

This document provides an overview of the Chat API endpoints.

## Start Chat with User

This endpoint allows an admin to start a new chat with a user.

- **URL:** `/api/admin/chat/start`
- **Method:** `POST`
- **Auth Required:** Yes (Admin Token)
- **Request Body:**

```json
{
    "adminId": "<admin_user_id>",
    "userId": "<user_id>"
}
```

- **Success Response:**

  - **Code:** 201 Created
  - **Content:**

```json
{
    "_id": "<conversation_id>",
    "participants": [
        "<admin_user_id>",
        "<user_id>"
    ],
    "lastMessage": "",
    "lastMessageTimestamp": "<timestamp>",
    "__v": 0
}
```

## Send Message

This endpoint allows a user to send a message to another user or admin.

- **URL:** `/api/chat/send`
- **Method:** `POST`
- **Auth Required:** Yes (User Token)
- **Request Body:**

```json
{
    "sender": "<sender_user_id>",
    "receiver": "<receiver_user_id>",
    "message": "<your_message_here>"
}
```

- **Success Response:**

  - **Code:** 201 Created
  - **Content:**

```json
{
    "_id": "<message_id>",
    "conversationId": "<conversation_id>",
    "sender": "<sender_user_id>",
    "receiver": "<receiver_user_id>",
    "message": "<your_message_here>",
    "timestamp": "<timestamp>",
    "__v": 0
}
```

## Get Conversations

This endpoint retrieves all conversations for a given user.

- **URL:** `/api/chat/conversations/:userId`
- **Method:** `GET`
- **Auth Required:** Yes (User Token)
- **URL Parameters:**

  - `userId=[string]` (required) - The ID of the user.

- **Success Response:**

  - **Code:** 200 OK
  - **Content:**

```json
[
    {
        "_id": "<conversation_id>",
        "participants": [
            {
                "_id": "<user_id>",
                "username": "<username>"
            },
            {
                "_id": "<admin_user_id>",
                "username": "<admin_username>"
            }
        ],
        "lastMessage": "<last_message>",
        "lastMessageTimestamp": "<timestamp>",
        "__v": 0
    }
]
```

## Get Messages

This endpoint retrieves all messages for a given conversation.

- **URL:** `/api/chat/messages/:conversationId`
- **Method:** `GET`
- **Auth Required:** Yes (User Token)
- **URL Parameters:**

  - `conversationId=[string]` (required) - The ID of the conversation.

- **Success Response:**

  - **Code:** 200 OK
  - **Content:**

```json
[
    {
        "_id": "<message_id>",
        "conversationId": "<conversation_id>",
        "sender": "<sender_user_id>",
        "receiver": "<receiver_user_id>",
        "message": "<message_content>",
        "timestamp": "<timestamp>",
        "__v": 0
    }
]
```
