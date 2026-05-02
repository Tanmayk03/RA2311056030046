import express from 'express';
import cors from 'cors';
import { Log } from 'logging_middleware';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/notify', async (req, res) => {
    try {
        await Log('backend', 'info', 'controller', 'Received notification request');
        
        const { message } = req.body;
        if (!message) {
            await Log('backend', 'error', 'handler', 'received string, expected bool'); // Using the example from doc
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
