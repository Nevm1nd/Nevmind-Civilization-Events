require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;

// Discord OAuth2 credentials from your Discord application
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

// Route for Discord login redirect
app.get('/auth/discord/callback', async (req, res) => {
  const code = req.query.code;

  if (!code) return res.send('No code provided');

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI,
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const accessToken = tokenResponse.data.access_token;

    // Fetch user info
    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    // Optional: check if user is in your server
    const guildId = process.env.GUILD_ID;
    const memberResponse = await axios.get(`https://discord.com/api/users/@me/guilds`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const isMember = memberResponse.data.some(g => g.id === guildId);

    res.json({
      user: userResponse.data,
      inServer: isMember
    });

  } catch (err) {
    console.error(err);
    res.send('Error fetching Discord data');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
