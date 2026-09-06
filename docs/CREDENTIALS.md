# RiceGuard AI - Credentials & Security Architecture

## 1. Demo & Pre-Configured Accounts

All accounts in RiceGuard AI are stored with **industry-standard salted bcrypt hashing**. Passwords are never stored or transmitted in plain text.

| Role | Name | Identifier (Phone / Email) | Password | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Farmer** | Ramesh Patel | `9123456780` / `ramesh@riceguard.org` | `Farmer@12345` | Scan leaves, view field history, chat with AI agronomist, manage field plots |
| **Admin** | Dr. Ramanathan (Agri Officer) | `9876543210` / `admin@riceguard.org` | `Admin@12345` | Review expert analyses, manage disease database, view system analytics & models |

---

## 2. Password & Security Standards

1. **Bcrypt Hashing**:
   - Every password submitted at registration or password change is processed via `bcrypt.hashpw(pwd_bytes, bcrypt.gensalt())`.
   - Salts are automatically and uniquely generated per user record.
   - Truncation protection prevents denial-of-service on bcrypt's 72-byte limit.

2. **JWT Authentication**:
   - Authentication returns a stateless JSON Web Token (JWT) signed with `HS256`.
   - Default token validity is 7 days (`ACCESS_TOKEN_EXPIRE_MINUTES = 10080`).
   - The token contains the unique `sub` (User ID).

3. **Rotating the Production `SECRET_KEY`**:
   - To keep login tokens secure in production, set a high-entropy secret key in your environment variables:
   ```bash
   python -c "import secrets; print(secrets.token_hex(32))"
   ```
   - In your cloud hosting provider (e.g. Render dashboard under Environment):
   ```env
   SECRET_KEY=your_generated_random_hexadecimal_secret_key_here
   ```

---

## 3. Changing Passwords

### Via API:
- Endpoint: `POST /api/auth/change-password`
- Header: `Authorization: Bearer <access_token>`
- Body:
  ```json
  {
    "current_password": "Farmer@12345",
    "new_password": "YourStrongNewPassword#2026"
  }
  ```

### Via Registration:
- Any farmer can register with their own phone number and a private strong password at `/register`.
