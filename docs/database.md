# SecureBank – Database Schema

## Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ TRANSACTION : "sends"
    USER ||--o{ TRANSACTION : "receives"
    USER ||--o{ VIRTUAL_CARD : "owns"
    USER ||--o{ DEVICE : "logs in from"
    USER ||--o{ AUDIT_LOG : "generates"

    USER {
        ObjectId _id PK
        String name
        String email UK
        String password
        String role "user | admin"
        Number accountBalance "default: 1000"
        String refreshToken
        Boolean twoFactorEnabled
        String twoFactorSecret
        String transferPinHash
        Date createdAt
        Date updatedAt
    }

    TRANSACTION {
        ObjectId _id PK
        ObjectId sender FK
        ObjectId receiver FK
        Number amount
        String reference UK
        String requestId UK "sparse"
        Boolean moneyDebited
        String status "PROCESSING | SUCCESS | FAILED | REFUNDED"
        Date createdAt
        Date updatedAt
    }

    VIRTUAL_CARD {
        ObjectId _id PK
        ObjectId user FK
        String cardNumber "encrypted"
        String cvv "encrypted"
        String expiryDate
        String cardHolder
        String cardType "visa | mastercard"
        Boolean isActive
        Number spendingLimit
        Date createdAt
    }

    AUDIT_LOG {
        ObjectId _id PK
        ObjectId user FK
        String action
        String ipAddress
        String device
        Object details
        Date createdAt
    }

    DEVICE {
        ObjectId _id PK
        ObjectId user FK
        String ip
        String browser
        String deviceName
        Date lastLogin
        Date createdAt
    }
```

## Indexing Strategy

| Collection    | Field(s)              | Type   | Purpose                                  |
|---------------|----------------------|--------|------------------------------------------|
| Users         | `email`              | Unique | Fast user lookup during login            |
| Transactions  | `sender`, `receiver` | Index  | Transaction history queries              |
| Transactions  | `reference`          | Unique | Unique transfer references               |
| Transactions  | `requestId`          | Unique (sparse) | Idempotency enforcement       |
| Transactions  | `createdAt`          | Index  | Sorted transaction history               |
| Transactions  | `status`             | Index  | Refund service queries                   |
| AuditLogs     | `user`, `createdAt`  | Compound | Audit trail queries                    |
| Devices       | `user`, `ip`         | Compound | Device deduplication                   |
