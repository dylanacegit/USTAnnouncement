# Users Collection Schema

MongoDB collection: `users`

```js
{
  _id: ObjectId,
  role: "student" | "teacher",
  first_name: String,
  last_name: String,
  email: String, // unique, must end with @ust.edu.ph
  password: String, // bcrypt hash only
  student_employee_number: String,
  year_level: String,
  faculty: String,
  is_verified: Boolean,
  verification_token: String,
  verification_token_expires_at: Date,
  created_at: Date
}
```

Indexes:

```js
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ verification_token: 1 }, { sparse: true })
```
