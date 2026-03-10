export default async function handler(req, res) {
  const { TWITCH_CLIENT_ID, TWITCH_ACCESS_TOKEN } = process.env;

  try {
    // Get broadcaster ID
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

    // Get schedule
    const schedRes = await fetch(
      `https://api.twitch.tv/helix/schedule?broadcaster_id=${broadcasterId}`,
      {
        headers: {
          "Client-ID": TWITCH_CLIENT_ID,
          Authorization: `Bearer ${TWITCH_ACCESS_TOKEN}`,
        },
      },
    );
    const schedData = await schedRes.json();

    // days[0]=Mon ... days[6]=Sun, null means no stream
    const days = [null, null, null, null, null, null, null];
    // Sun=0,Mon=1,...,Sat=6 → remap to Mon-first (Mon=0,...,Sun=6)
    const toMonFirst = [6, 0, 1, 2, 3, 4, 5]; // toMonFirst[sundayFirst] = mondayFirstIndex

    for (const seg of schedData.data?.segments ?? []) {
      if (!seg.is_recurring || seg.canceled_until) continue;

      const date = new Date(seg.start_time);
      const dayStr = new Intl.DateTimeFormat("en", {
        timeZone: "Europe/Oslo",
        weekday: "short",
      }).format(date);
      const sunFirst = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(dayStr);
      const monFirst = toMonFirst[sunFirst];

      const time = new Intl.DateTimeFormat("no", {
        timeZone: "Europe/Oslo",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(date);

      if (days[monFirst] === null) {
        days[monFirst] = time;
      }
    }

    res.status(200).json({ days });
  } catch (e) {
    res.status(500).json({ days: [null, null, null, null, null, null, null] });
  }
}
