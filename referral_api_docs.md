
# Refer & Earn API Documentation for Frontend Integration

## 1. Overview

This document provides frontend developers with the necessary information to integrate with the "Refer & Earn" feature. The system allows users to refer friends using a unique code and earn rewards.

---

## 2. Integrating Referral at Signup

To attribute a new user to a referrer, the `referralCode` must be passed during the signup process.

**Endpoint:** `POST /api/v1/auth/signup`

### Request Body

Include an optional `referralCode` field in the user registration payload.

```json
{
  "email": "new.user@example.com",
  "password": "strongpassword123",
  "name": "Jane Doe",
  "referralCode": "JOHN-D4E8"
}
```

### Frontend Logic

-   Your signup form should have an optional input field for the referral code.
-   If the user submits a code, include it in the request body.
-   The backend will handle validation. If the code is invalid, the API will return a `400 Bad Request` error. Ensure you display a user-friendly error message in this case.

---

## 3. Referral Dashboard

Authenticated users can view their referral statistics, earnings, and unique referral code on their dashboard.

**Endpoint:** `GET /api/v1/referral/dashboard`

**Authentication:** A valid JWT must be included in the `Authorization` header.

```
Authorization: Bearer <YOUR_JWT_TOKEN>
```

### Success Response (200 OK)

The endpoint returns an object containing the user's referral data.

```json
{
  "referralCode": "JANE-A1B2",
  "referralLink": "https://www.savemoney.com/signup?ref=JANE-A1B2",
  "earnings": 750.00,
  "referredUsersCount": 15
}
```

### Frontend Implementation

-   Fetch this data when the user navigates to their "Refer & Earn" dashboard page.
-   Display the `referralCode` and `referralLink` prominently so the user can easily share them.
-   Show the `earnings` and `referredUsersCount` to track their referral success.

### Error Handling

-   **401 Unauthorized:** If the JWT is missing or invalid, redirect the user to the login page.
-   **404 Not Found:** If the API returns a user not found error, handle it gracefully (e.g., show a "User account not found" message).
