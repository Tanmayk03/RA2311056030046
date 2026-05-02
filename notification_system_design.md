# Stage 1

## Core Actions
1. **Fetch Notifications**: Get paginated notifications for the logged-in user.
2. **Mark as Read**: Mark specific notifications or all notifications as read.
3. **Receive Real-time Notifications**: Real-time push mechanism for active sessions.

## REST API Endpoints

### 1. Get Notifications
- **Endpoint**: `GET /api/v1/notifications`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Request**: none (uses query params like `?limit=10&page=1`)
- **Response**:
```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "Placement",
      "message": "CSX Corporation hiring",
      "timestamp": "2026-04-22 17:51:18",
      "isRead": false
    }
  ]
}
```

### 2. Mark Notification as Read
- **Endpoint**: `PATCH /api/v1/notifications/:id/read`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Request**:
```json
{
  "isRead": true
}
```
- **Response**: `200 OK`

## Real-time Notifications Mechanism
I suggest using Server-Sent Events (SSE) or WebSockets. Given notifications are mostly one-way (server to client), SSE is lightweight and perfectly suited over HTTP/2 for real-time delivery without the overhead of bidirectional WebSockets.

---

# Stage 2

## Persistent Storage
I suggest **PostgreSQL**. Notifications require structured relationships (User to Notifications) and strong consistency (so read statuses aren't lost). PostgreSQL handles relations well and supports JSONB if we need flexible notification payload schemas later.

## DB Schema
```sql
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL
);

CREATE TYPE notif_type AS ENUM ('Event', 'Result', 'Placement');

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    type notif_type NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Scaling Problems and Solutions
**Problems as data increases:**
1. Slow read queries due to table size.
2. Database overwhelming on heavy write bursts (e.g., notifying all 50k students).

**Solutions:**
1. **Indexing**: Add indexes on `student_id` and `created_at`.
2. **Partitioning**: Partition the notifications table by month/year so older data doesn't slow down active queries.
3. **Archiving**: Move notifications older than 3 months to cold storage (e.g., S3 or a cheaper DB).

## Queries
**Fetch Unread:**
`SELECT * FROM notifications WHERE student_id = 1 AND is_read = FALSE ORDER BY created_at DESC LIMIT 10;`
**Mark as Read:**
`UPDATE notifications SET is_read = TRUE WHERE id = 'uuid' AND student_id = 1;`

---

# Stage 3

## Query Analysis
The query is accurate but slow because it requires scanning the entire table. Filtering by `studentID` and sorting by `createdAt` on a table of 5 million rows without composite indexes leads to expensive `Seq Scans` and in-memory `filesorts`.

**What I would change:**
Add a composite index on `(studentID, isRead, createdAt)`.

**Adding indexes on every column?**
No, this is bad advice. Indexes speed up reads but slow down writes (INSERT/UPDATE/DELETE) because the index tree must be updated. Also, indexes consume significant disk space. Only index columns used in WHERE, JOIN, and ORDER BY clauses.

## Placement Query
```sql
SELECT DISTINCT s.*
FROM students s
JOIN notifications n ON s.id = n.student_id
WHERE n.type = 'Placement' 
  AND n.created_at >= NOW() - INTERVAL '7 days';
```

---

# Stage 4

## Performance Improvement
The DB is overwhelmed by fetches on each page load.

**Solution:** Implement a caching layer using **Redis**.
1. When a user requests notifications, fetch from Redis first.
2. If absent (cache miss), fetch from DB, store in Redis with a TTL (Time-to-Live), and return to user.
3. When a new notification is generated, update the DB and invalidate or push to the Redis cache for that user.

**Tradeoffs:**
- **Pros**: Massively reduces DB load. Page loads are much faster.
- **Cons**: Cache invalidation is complex. There might be eventual consistency issues (a user might see a stale notification state if the cache hasn't synced properly).

---

# Stage 5

## Shortcomings in notify_all
1. **Synchronous Execution**: Running `send_email` and `save_to_db` in a loop for 50,000 students synchronously will block the main thread, timeout the request, and take hours.
2. **Lack of Fault Tolerance**: If it fails at student 200, the loop crashes. The remaining 49,800 students get nothing. We also don't know exactly who failed without parsing logs.

## Redesign for Reliability and Speed
We need an asynchronous, event-driven architecture using a Message Broker (like RabbitMQ or Kafka).
1. The `notify_all` function quickly inserts 50,000 jobs into a Message Queue (e.g., "email_queue" and "db_queue").
2. Background worker processes consume these queues independently. If a worker fails to send an email, the message goes back to the queue to be retried automatically.

## Should DB save and email happen together?
No, they should be decoupled. Saving to the DB is fast and internal. Sending an email relies on a 3rd-party provider (SendGrid, AWS SES) which can rate limit, timeout, or fail. Separating them ensures that if the email API goes down, the in-app notification is still saved to the DB instantly.

---

# Stage 6

## Priority Inbox Approach
For the priority inbox, we need to fetch the notifications and sort them on the fly based on two factors:
1. **Weight**: Placement (3) > Result (2) > Event (1).
2. **Recency**: Newer notifications score higher.

**Algorithm:**
Since we fetch the data dynamically from the API, we map each type to a base weight. To factor in recency without complex math, we can create a combined sort function. In our backend code, we first check if the weights are different. If one notification has a higher weight (e.g., Placement vs Event), it gets priority. If the weights are equal (e.g., two Placement notifications), we compare their timestamps and prioritize the most recent one. 

I have implemented this functioning logic in the Express backend (`notification_app_be`). When the frontend fetches `/api/notifications/priority`, the backend pulls from the Evaluation Server, calculates the priorities, sorts the array, slices the top 10, and returns them to the React frontend.
