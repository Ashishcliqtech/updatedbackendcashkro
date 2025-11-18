# Backend API Updates for Frontend Integration

This document outlines recent backend changes that require updates to the frontend application. The primary goal of these changes was to shift from an automatic cashback system to a manual one, giving administrators full control over user rewards and tracking.

## High-Level Summary

The core logic for handling cashback has been fundamentally changed:

- **Automatic Cashback Disabled:** The system **no longer** automatically creates a "pending" cashback transaction when a user clicks an offer or when a purchase webhook is received.
- **Manual Cashback is Now Standard:** All cashback must be awarded manually by an administrator through the admin panel.
- **Enhanced Click Tracking:** We have improved the ability for admins to track user clicks and associate them with user profiles.

---

## New API Endpoints

These new endpoints have been added to support the manual cashback workflow and improve admin oversight.

### 1. `GET /api/admin/clicks`
-   **Description:** Retrieves a paginable list of all offer clicks, linking each click to a user, offer, and store. This is essential for tracking which user to reward.
-   **Response Body Example:**
    ```json
    [
        {
            "_id": "60b8a4f7f5a9e3b4a8f8b3e3",
            "user": {
                "_id": "60b8a4f7f5a9e3b4a8f8b3e1",
                "name": "John Doe",
                "email": "john.doe@example.com"
            },
            "offer": {
                "_id": "60b8a4f7f5a9e3b4a8f8b3e2",
                "title": "10% Cashback on Electronics"
            },
            "store": {
                "_id": "60b8a4f7f5a9e3b4a8f8b3e0",
                "name": "Best Buy"
            },
            "clickId": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
            "createdAt": "2024-05-29T10:00:00.000Z"
        }
    ]
    ```

### 2. `GET /api/admin/user/click/:clickId`
-   **Description:** Allows an admin to find a specific user's profile by providing the `clickId` from an affiliate network or the clicks list.
-   **URL Parameter:**
    -   `clickId` (string): The unique ID of the click.
-   **Response Body Example:**
    ```json
    {
        "_id": "60b8a4f7f5a9e3b4a8f8b3e1",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": "user"
    }
    ```

### 3. `POST /api/admin/wallet/add-cashback`
-   **Description:** This is the **primary endpoint for awarding cashback**. It directly adds a confirmed cashback amount to a user's wallet and creates a corresponding transaction record.
-   **Request Body:**
    ```json
    {
        "userId": "60b8a4f7f5a9e3b4a8f8b3e1",
        "amount": 15.50,
        "description": "Cashback for purchase at Best Buy"
    }
    ```
-   **Backend Logic:**
    1.  Increments `availableCashback` and `totalCashback` in the user's `Wallet`.
    2.  Creates a new `Transaction` with `status: 'confirmed'`.
    3.  Sends a real-time notification to the user about the credited cashback.
-   **Response Body Example:**
    ```json
    {
        "message": "Cashback added successfully and user notified.",
        "wallet": { "...updated wallet object..." },
        "transaction": { "...new transaction object..." }
    }
    ```

### 4. `POST /api/admin/wallet/update`

- **Description:** Allows an administrator to manually adjust a user's wallet balance. This can be used to add or remove funds for various reasons, such as correcting errors or applying manual adjustments. The `amount` can be positive (for a credit) or negative (for a debit).
- **Request Body:**
  ```json
  {
      "userId": "60b8a4f7f5a9e3b4a8f8b3e1",
      "amount": -5.00,
      "description": "Correction for incorrect cashback award."
  }
  ```
- **Backend Logic:**
  1.  Adjusts the `availableCashback` in the user's `Wallet` by the given `amount`.
  2.  If the `amount` is positive, it also increases the `totalCashback`.
  3.  Creates a `Transaction` record (`credit` or `debit`) with a `confirmed` status.
  4.  Sends a real-time notification to the user about the wallet adjustment.
- **Response Body Example:**
  ```json
  {
      "message": "User wallet updated successfully.",
      "wallet": { "...updated wallet object..." },
      "transaction": { "...new transaction object..." }
  }
  ```

---

## Updated API Endpoints

### 1. `POST /api/offers/:id/track`
-   **Description:** The offer click tracking endpoint has been enhanced to support a new affiliate URL format.
-   **Change:** If an offer's `url` contains the placeholder `{replace_it}`, the backend will now substitute it with the unique `clickId`. The old logic of appending `?subid=<clickId>` is retained as a fallback.
-   **Frontend Impact:** No change is needed on the frontend. The response (`{ redirectUrl: "..." }`) remains the same. This is just for informational purposes.

---

## Wallet & Transaction Logic Changes

This section details the most critical changes to the cashback workflow.

### Old Flow (Now Disabled)
1.  User clicks offer -> `Click` created, `Transaction` created with `status: 'pending'`.
2.  `Wallet`'s `pendingCashback` is incremented.
3.  Admin receives webhook -> Admin approves/rejects transaction.
4.  On approval, `pendingCashback` decreases, `availableCashback` increases.

### New Flow (Current)
1.  User clicks offer -> Only a `Click` record is created with a `clickId`. **No transaction is created and the wallet is not touched.**
2.  Admin receives conversion data from the affiliate network, which includes the `clickId`.
3.  Admin uses the `clickId` to find the user (`GET /api/admin/user/click/:clickId`).
4.  Admin awards cashback using `POST /api/admin/wallet/add-cashback`.
5.  This action **directly increases** the user's `availableCashback` and `totalCashback` in their `Wallet` and creates a `confirmed` `Transaction` record for their history. There is no "pending" state.

---

## Disabled Features

-   **Automatic Pending Cashback:** As stated, clicking an offer **no longer** creates a pending cashback transaction.
-   **Webhook Processing:** The webhook endpoints (`/api/webhook/...`) are now inactive in terms of processing logic. They will receive requests but will not create or update any transactions or wallets. This functionality has been fully replaced by the manual admin process.
