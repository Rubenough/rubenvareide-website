export default async function handler(req, res) {
  const { TWITCH_CLIENT_ID, TWITCH_ACCESS_TOKEN } = process.env;

  try {
    // Get broadcaster ID from username
    const userRes = await fetch(
      "https://api.twitch.tv/helix/users?login=rubenvareide",
      {
        headers: {
          "Client-ID": TWITCH_CLIENT_ID,
          Authorization: `Bearer ${TWITCH_ACCESS_TOKEN}`,
        },
      },
    );
    const userData = await userRes.json();
    const broadcasterId = userData.data[0].id;

    // Get channel emotes
    const emotesRes = await fetch(
      `https://api.twitch.tv/helix/chat/emotes?broadcaster_id=${broadcasterId}`,
      {
        headers: {
          "Client-ID": TWITCH_CLIENT_ID,
          Authorization: `Bearer ${TWITCH_ACCESS_TOKEN}`,
        },
      },
    );
    const emotesData = await emotesRes.json();

    // Group emotes by tier
    const tiers = { 1: [], 2: [], 3: [] };
    for (const emote of emotesData.data) {
      const tier = parseInt(emote.tier) / 1000;
      if (tiers[tier]) {
        const format = emote.format.includes("animated") ? "animated" : "static";
        tiers[tier].push({
          name: emote.name,
          url: `https://static-cdn.jtvnw.net/emoticons/v2/${emote.id}/${format}/dark/2.0`,
        });
      }
    }

    res.status(200).json(tiers);
  } catch (e) {
    res.status(500).json({ 1: [], 2: [], 3: [] });
  }
}
