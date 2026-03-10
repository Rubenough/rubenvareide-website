export default async function handler(req, res) {
  const { TWITCH_CLIENT_ID, TWITCH_ACCESS_TOKEN } = process.env;

  try {
    const response = await fetch(
      "https://api.twitch.tv/helix/streams?user_login=rubenvareide",
      {
        headers: {
          "Client-ID": TWITCH_CLIENT_ID,
          Authorization: `Bearer ${TWITCH_ACCESS_TOKEN}`,
        },
      },
    );
    const data = await response.json();
    const isLive = data.data && data.data.length > 0;
    res.status(200).json({ isLive });
  } catch (e) {
    res.status(500).json({ isLive: false });
  }
}
