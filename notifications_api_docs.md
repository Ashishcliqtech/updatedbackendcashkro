# Notification API Documentation

This document provides a detailed description of the notification-related APIs.

## User-Facing APIs

### 1. Get User Notifications

-   **HTTP Method:** `GET`
-   **Endpoint:** `/notifications/{userId}`
-   **Description:** Retrieves all notifications for a specific user.
-   **Parameters:**
    -   `userId` (string, required): The ID of the user.
-   **Response:**
    -   **200 OK**
        ```json
        [
          {
            "_id": "60c72b3f1f7a4d001f2e3a3e",
            "userId": "60c72b3f1f7a4d001f2e3a3d",
            "type": "deal",
            "title": "New Deal Available!",
            "message": "Check out the latest deal on electronics.",
            "isRead": false,
            "createdAt": "2024-05-23T10:00:00.000Z"
          }
        ]
        ```

### 2. Get Notification Settings

-   **HTTP Method:** `GET`
-   **Endpoint:** `/user/notifications/settings`
-   **Description:** Retrieves the current notification settings for the authenticated user.
-   **Response:**
    -   **200 OK**
        ```json
        {
          "email": {
            "deals": true,
            "cashback": true,
            "referrals": true
          },
          "push": {
            "deals": true,
            "cashback": false,
            "referrals": true
          }
        }
        ```

### 3. Update Notification Settings

-   **HTTP Method:** `PUT`
-   **Endpoint:** `/user/notifications/settings`
-   **Description:** Updates the notification settings for the authenticated user.
-   **Request Body:**
    ```json
    {
      "email": {
        "deals": false
      },
      "push": {
        "cashback": true
      }
    }
    ```
-   **Response:**
    -   **200 OK**
        ```json
        {
          "email": {
            "deals": false,
            "cashback": true,
            "referrals": true
          },
          "push": {
            "deals": true,
            "cashback": true,
            "referrals": true
          }
        }
        ```

### 4. Mark a Notification as Read

-   **HTTP Method:** `PUT`
-   **Endpoint:** `/notifications/{id}/read`
-   **Description:** Marks a specific notification as read.
-   **Parameters:**
    -   `id` (string, required): The ID of the notification.
-   **Response:**
    -   **200 OK**
        ```json
        {
          "msg": "Notification marked as read"
        }
        ```

### 5. Mark All Notifications as Read

-   **HTTP Method:** `PUT`
-   **Endpoint:** `/notifications/read-all`
-   **Description:** Marks all notifications for the authenticated user as read.
-   **Response:**
    -   **200 OK**
        ```json
        {
          "msg": "All notifications marked as read"
        }
        ```

### 6. Mark a Notification as Clicked

-   **HTTP Method:** `POST`
-   **Endpoint:** `/notifications/{id}/click`
-   **Description:** Records a click on a notification. This can be used for tracking user engagement.
-   **Parameters:**
    -   `id` (string, required): The ID of the notification.
-   **Response:**
    -   **200 OK**
        ```json
        {
          "msg": "Notification click recorded"
        }
        ```

## Admin APIs

### 1. Send a Notification

-   **HTTP Method:** `POST`
-   **Endpoint:** `/admin/notifications/send`
-   **Description:** Sends a notification to a specific user, a group of users, or all users.
-   **Request Body:**
    ```json
    {
      "type": "deal",
      "title": "Special Offer!",
      "message": "Don't miss this exclusive deal.",
      "userId": "60c72b3f1f7a4d001f2e3a3d"
    }
    ```
-   **Response:**
    -   **201 Created**
        ```json
        {
          "_id": "60c72b3f1f7a4d001f2e3a3f",
          "type": "deal",
          "title": "Special Offer!",
          "message": "Don't miss this exclusive deal.",
          "userId": "60c72b3f1f7a4d001f2e3a3d",
          "isRead": false,
          "createdAt": "2024-05-23T12:00:00.000Z"
        }
        ```

### 2. Get Notification Stats

-   **HTTP Method:** `GET`
-   **Endpoint:** `/admin/notifications/stats`
-   **Description:** Retrieves statistics about notifications, such as the total number of notifications sent, read rates, and click-through rates.
-   **Response:**
    -   **200 OK**
        ```json
        {
          "totalSent": 1500,
          "totalRead": 750,
          "readRate": 0.5,
          "totalClicks": 300,
          "clickThroughRate": 0.2
        }
        ```
