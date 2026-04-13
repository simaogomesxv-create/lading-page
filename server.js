const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// POST endpoint to track events
app.post('/track', async (req, res) => {
    const eventData = req.body;
    const accessToken = process.env.FB_ACCESS_TOKEN; // Access token from environment variables

    // Validate incoming event data (basic validation)
    if (!eventData || !eventData.event_name || !eventData.event_data) {
        return res.status(400).json({ error: 'Invalid event data' });
    }

    const userIP = req.ip;
    const userAgent = req.get('User-Agent');
    const timestamp = Math.floor(Date.now() / 1000); // Current UNIX timestamp

    // Prepare the payload for Facebook API
    const payload = {
        data: [{
            event_name: eventData.event_name,
            event_time: timestamp,
            user_data: {
                client_ip_address: userIP,
                client_user_agent: userAgent,
            },
            event_data: eventData.event_data,
        }],
    };

    try {
        // Send event to Facebook Conversions API
        const response = await axios.post(`https://graph.facebook.com/v18.0/945281121799539/events?access_token=${accessToken}`, payload);
        return res.status(200).json({ success: true, response: response.data });
    } catch (error) {
        console.error('Error sending event to Facebook API:', error);
        return res.status(500).json({ error: 'Failed to send event' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
