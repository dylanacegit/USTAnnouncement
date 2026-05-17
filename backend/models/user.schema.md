# Users Collection Schema

MongoDB collection: `users`

```js
{
  _id: ObjectId,
  role: "admin" | "user",
  occupation: "student" | "teacher" | "",
  first_name: String,
  last_name: String,
  email: String, // unique, must end with @ust.edu.ph
  password: String, // bcrypt hash only
  student_employee_number: String,
  year_level: String,
  faculty: String,
  account_status: "active" | "archived",
  is_verified: Boolean,
  verification_token: String,
  verification_token_expires_at: Date,
  password_reset_token: String,
  password_reset_token_expires_at: Date,
  bookmarked_event_ids: ObjectId[],
  created_by: String,
  created_at: Date,
  updated_by: String,
  updated_at: Date
}
```

Indexes:

```js
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ verification_token: 1 }, { sparse: true })
db.users.createIndex({ password_reset_token: 1 }, { sparse: true })
```
