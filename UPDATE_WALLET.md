### `POST /api/admin/wallet/update`

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