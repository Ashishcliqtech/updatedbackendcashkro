# Notification System API Documentation

This document provides a comprehensive guide for front-end developers on integrating the new real-time notification system.

## Table of Contents
1. [Overview](#overview)
2. [Real-time Notifications (WebSocket)](#real-time-notifications-websocket)
3. [User-Facing API Endpoints](#user-facing-api-endpoints)
    - [Get All Notifications](#get-all-notifications)
    - [Get Notification Settings](#get-notification-settings)
    - [Update Notification Settings](#update-notification-settings)
    - [Mark Notification as Read](#mark-notification-as-read)
    - [Mark Notification as Clicked](#mark-notification-as-clicked)
4. [Admin API Endpoints](#admin-api-endpoints)
    - [Create and Send a Notification](#create-and-send-a-notification)
    - [Get All Notification Stats](#get-all-notification-stats)
    - [Get Single Notification Stats](#get-single-notification-stats)
5. [Data Models](#data-models)
    - [Notification Object](#notification-object)
    - [Notification Settings Object](#notification-settings-object)

---

## Overview

The notification system adds real-time communication with users and provides APIs for managing notification preferences and history. It uses a combination of REST APIs and WebSockets (Socket.io).

**Authentication**: All endpoints listed below require a valid JSON Web Token (JWT) to be passed in the `Authorization` header as a Bearer token.

`Authorization: Bearer <YOUR_JWT_TOKEN>`

---

## Real-time Notifications (WebSocket)

To receive notifications in real-time, the client must connect to the Socket.io server upon user login.

**1. Connection:**
Connect to the server's root URL.

```javascript
import { io } from "socket.io-client";

const socket = io("YOUR_SERVER_URL"); 
```

**2. User Identification:**
After connecting, the client **must** emit a `join` event with the user's ID. This allows the server to map the user to their socket connection.

```javascript
// Get the user's ID after they log in
const userId = "user_id_from_your_auth_context"; 

socket.on("connect", () => {
  console.log("Connected to the notification server!");
  socket.emit("join", userId);
});
```

**3. Listening for New Notifications:**
Listen for the `new_notification` event. The server will push a `Notification` object as the payload.

```javascript
socket.on("new_notification", (notification) => {
  console.log("New notification received:", notification);
  // Here, you can trigger a UI update, like showing a toast or updating a notification badge.
});
```

**4. Disconnecting:**
Handle disconnection gracefully.

```javascript
socket.on("disconnect", () => {
  console.log("Disconnected from the notification server.");
});
```
---

## User-Facing API Endpoints

### Get All Notifications
- **`GET /api/notifications`**
- **Description**: Retrieves a list of all notifications for the authenticated user, sorted from newest to oldest.
- **Response `200 OK`**: 
```json
[
    {
        "_id": "60d0fe4f5b9d7a1b4c8d9c1e",
        "recipient": "user_id",
        "title": "Welcome to the Platform!",
        "message": "Thanks for joining us. Here's a 10% off coupon for your first purchase.",
        "type": "system",
        "isRead": false,
        "isClicked": false,
        "createdAt": "2023-10-27T10:00:00.000Z"
    },
    ...
]
```

### Get Notification Settings
- **`GET /api/user/notifications/settings`**
- **Description**: Retrieves the current notification preferences for the authenticated user.
- **Response `200 OK`**:
```json
{
    "deals": { "email": true, "push": true },
    "cashback": { "email": true, "push": true },
    "withdrawals": { "email": true, "push": false },
    "referral": { "email": true, "push": true },
    "support": { "email": true, "push": true },
    "system": { "email": true, "push": true }
}
```

### Update Notification Settings
- **`PUT /api/user/notifications/settings`**
- **Description**: Updates the notification preferences for the authenticated user. You can send one or more categories to update.
- **Request Body**:
```json
{
    "deals": { "push": false },
    "withdrawals": { "email": false, "push": false }
}
```
- **Response `200 OK`**: The updated settings object.
```json
{
    "deals": { "email": true, "push": false },
    "cashback": { "email": true, "push": true },
    "withdrawals": { "email": false, "push": false },
    "referral": { "email": true, "push": true },
    "support": { "email": true, "push": true },
    "system": { "email": true, "push": true }
}
```

### Mark Notification as Read
- **`POST /api/notifications/:id/read`**
- **Description**: Marks a specific notification as read. This is useful for tracking when a user has seen a notification.
- **`id`**: The ID of the notification.
- **Response `200 OK`**:
```json
{ "msg": "Notification marked as read" }
```

### Mark Notification as Clicked
- **`POST /api/notifications/:id/click`**
- **Description**: Marks a specific notification as clicked. This is useful for tracking engagement and click-through rates.
- **`id`**: The ID of the notification.
- **Response `200 OK`**:
```json
{ "msg": "Notification marked as clicked" }
```

---

## Admin API Endpoints

These endpoints are restricted to users with the `admin` role.

### Create and Send a Notification
- **`POST /api/admin/notifications`**
- **Description**: Creates and sends a new notification to a specific user.
- **Request Body**:
```json
{
    "recipient": "user_id_to_send_to",
    "title": "A Special Offer Just for You!",
    "message": "Use code SPECIAL25 for 25% off your next order.",
    "type": "deals",
    "actionUrl": "/offers/offer_id_123"
}
```
- **Response `201 Created`**: The created `Notification` object.

### Get All Notification Stats
- **`GET /api/admin/notifications/stats`**
- **Description**: Retrieves aggregate statistics for all notifications sent.
- **Response `200 OK`**:
```json
{
    "totalSent": 1500,
    "totalOpens": 750,
    "totalClicks": 300,
    "openRate": 50,
    "clickRate": 20
}
```

### Get Single Notification Stats
- **`GET /api/admin/notifications/:id/stats`**
- **Description**: Retrieves statistics for a single notification.
- **`id`**: The ID of the notification.
- **Response `200 OK`**:
```json
{
    "sent": 1,
    "opens": 1,
    "clicks": 0,
    "openRate": 100,
    "clickRate": 0
}
```

---

## Data Models

### Notification Object
This is the structure of the notification object received through the WebSocket and API endpoints.

```typescript
{
  _id: string;            // Unique identifier for the notification
  recipient: string;        // The User ID of the recipient
  title: string;            // The title of the notification
  message: string;          // The main content of the notification
  type: "deals" | "cashback" | "withdrawals" | "referral" | "support" | "system"; // Category
  actionUrl?: string;       // Optional URL to navigate to when clicked
  isRead: boolean;          // True if the user has seen the notification
  isClicked: boolean;       // True if the user has clicked on the notification
  createdAt: Date;          // Timestamp of when the notification was created
}
```

### Notification Settings Object
This is the structure of the user's notification preferences.

```typescript
{
  deals: {
    email: boolean;
    push: boolean; // For real-time/mobile push notifications
  },
  cashback: {
    email: boolean;
    push: boolean;
  },
  withdrawals: {
    email: boolean;
    push: boolean;
  },
  referral: {
    email: boolean;
    push: boolean;
  },
  support: {
    email: boolean;
    push: boolean;
  },
  system: {
    email: boolean;
    push: boolean;
  }
}
```
