import express from 'express';
import cors from 'cors';
import { Log, getToken } from 'logging_middleware';

const app = express();
app.use(cors());
app.use(express.json());

// Stage 6: Priority Inbox Endpoint
app.get('/api/notifications/priority', async (req, res) => {
    try {
        await Log('backend', 'info', 'controller', 'Fetching priority notifications');
        
        const token = await getToken();
        if (!token) {
            return res.status(500).json({ error: 'Failed to authenticate with evaluation server' });
        }

        const response = await fetch('http://20.207.122.201/evaluation-service/notifications', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            await Log('backend', 'error', 'api', 'Failed to fetch from evaluation service');
            return res.status(500).json({ error: 'Failed to fetch notifications' });
        }

        const data = await response.json();
        const notifications = data.notifications || [];

        // Priority Logic: Weight mapping
        const weightMap = {
            'Placement': 3,
            'Result': 2,
            'Event': 1
        };

        // Sort notifications based on weight and then timestamp
        const sortedNotifications = notifications.sort((a, b) => {
            const weightA = weightMap[a.Type] || 0;
            const weightB = weightMap[b.Type] || 0;

            if (weightA !== weightB) {
                return weightB - weightA; // Higher weight comes first
            }

            // If weights are equal, sort by recency (newest first)
            const timeA = new Date(a.Timestamp).getTime();
            const timeB = new Date(b.Timestamp).getTime();
            return timeB - timeA;
        });

        // Top 10 notifications
        const top10 = sortedNotifications.slice(0, 10);

        await Log('backend', 'info', 'handler', 'Successfully prioritized top 10 notifications');
        res.status(200).json({ notifications: top10 });
    } catch (e) {
        await Log('backend', 'fatal', 'controller', 'Priority inbox fetch crashed');
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Original Notification Endpoint
app.post('/api/notify', async (req, res) => {
    try {
        await Log('backend', 'info', 'controller', 'Received notification request');
        
        const { message } = req.body;
        if (!message) {
            await Log('backend', 'error', 'handler', 'received string, expected bool');
            return res.status(400).json({ error: 'Message is required' });
        }
        
        res.status(200).json({ success: true, message: 'Notification sent successfully' });
    } catch (e) {
        await Log('backend', 'fatal', 'controller', 'Failed to send notification');
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(3000, async () => {
    console.log('Backend listening on port 3000');
    await Log('backend', 'info', 'utils', 'Backend server started');
});
