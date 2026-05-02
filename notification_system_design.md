# Stage 1

For the notifications API, we need a few basic things to get notifications and mark them as read.

GET /api/notifications
Headers: Authorization: Bearer <token>
Returns a list of notifications like this:
[{"id": "1", "type": "Placement", "message": "hiring now", "timestamp": "2026-04-22 17:51", "isRead": false}]

PATCH /api/notifications/read
Headers: Authorization: Bearer <token>
Body: {"id": "1"}
Marks the notification as read.

For real time stuff, we can just use Server-Sent Events (SSE) or WebSockets. SSE is probably easier here since the server just needs to push data to the client and we don't need two-way communication.

# Stage 2

I would suggest using PostgreSQL for the DB. It handles relationships really well and we need to make sure we don't lose data about whether a notification was read.

schema:
students table: id, name, email
notifications table: id, student_id, type, message, is_read, created_at

As data grows, reading from the database will get slow. I would solve this by adding indexes on student_id and created_at. We could also archive old notifications (like older than 3 months) to a cheaper storage to keep the main table small.

queries:
fetch unread: SELECT * FROM notifications WHERE student_id = 1 AND is_read = false ORDER BY created_at DESC LIMIT 10;

# Stage 3

The query they wrote is accurate but it will be very slow. It does a full table scan because there are 5 million rows and no indexes on those columns. 

To fix this, I would just add a composite index on (studentID, isRead, createdAt). 

Adding indexes on every column is a bad idea. Indexes take up a lot of disk space and they make writing to the DB (inserting/updating) slower. You should only index the columns you actually search by.

Placement query for last 7 days:
SELECT distinct s.* FROM students s JOIN notifications n ON s.id = n.student_id WHERE n.type = 'Placement' AND n.created_at >= NOW() - INTERVAL '7 days';

# Stage 4

If the DB is getting overwhelmed on every page load, we should add Redis as a cache. 
When a student loads the page, we check Redis first. If the notifications are there, we return them quickly. If not, we query the DB, send them to the user, and save them in Redis.
Tradeoff: sometimes the cache might have old data if we don't clear it properly when a new notification comes in.

# Stage 5

The pseudocode has a few big problems. It runs synchronously, so it will take hours for 50k students. Also, if it crashes at student 200, the loop breaks and the other 49,800 students get nothing.

To make it fast and reliable, we should use a message queue like RabbitMQ. We push all 50k jobs to the queue, and background workers process them. If an email fails to send, it just goes back to the queue to try again later.

Also, saving to the DB and sending the email should NOT happen together. Saving to DB is very fast, but emails can fail or timeout. We should separate them so the app notification always works even if the email provider goes down.

# Stage 6

For the priority inbox, we have to rank notifications based on their type (Placement > Result > Event) and how recent they are.

My approach: When we fetch the notifications, I gave them a weight. Placement gets 3, Result gets 2, Event gets 1. We sort the array by this weight first. If the weights are equal, we check the timestamps and put the newer one first.

I wrote this logic in the backend code. It fetches all the notifications, sorts them using this rule, and then just slices the top 10 and sends them to the frontend to be displayed.
