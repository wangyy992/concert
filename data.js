// ── 起始曲库（可在页面里自行增删 / 纠错 / 补链接）──────────────
// yt 字段 = YouTube 视频 ID（watch?v= 后面那一串）。留空的歌可在页面里点“🔎 找音源”补上。
// title 带 ★ 的是主打歌。
window.LIBRARY = {
  itzy: {
    name: "ITZY",
    color: "#ff3d7f",
    albums: [
      {
        title: "IT'z Different",
        year: "2019",
        type: "Single",
        tracks: [
          { title: "DALLA DALLA", title_kr: "달라달라", lead: true, yt: "pNfTK39k55U" },
          { title: "Want It?", yt: "" },
        ],
      },
      {
        title: "IT'z ICY",
        year: "2019",
        type: "EP",
        tracks: [
          { title: "ICY", lead: true, yt: "" },
          { title: "Cherry", yt: "" },
          { title: "Sorry Not Sorry", title_kr: "미안해 안 미안해", yt: "" },
          { title: "It'z Summer", yt: "" },
        ],
      },
      {
        title: "IT'z ME",
        year: "2020",
        type: "EP",
        tracks: [
          { title: "WANNABE", lead: true, yt: "fE2h3lGlOsk" },
          { title: "24HRS", yt: "" },
          { title: "Nobody Like You", yt: "" },
          { title: "That's a No", yt: "" },
        ],
      },
      {
        title: "Not Shy",
        year: "2020",
        type: "EP",
        tracks: [
          { title: "Not Shy", lead: true, yt: "" },
          { title: "Louder", yt: "" },
          { title: "SURF", yt: "" },
          { title: "ID", yt: "" },
          { title: "Be in Love", yt: "" },
        ],
      },
      {
        title: "GUESS WHO",
        year: "2021",
        type: "EP",
        tracks: [
          { title: "In the morning", title_kr: "마.피.아.", lead: true, yt: "" },
          { title: "Kidding Me", yt: "" },
          { title: "Wild Wild West", yt: "" },
          { title: "Shoot!", yt: "" },
          { title: "Tennis (0:0)", yt: "" },
        ],
      },
      {
        title: "CRAZY IN LOVE",
        year: "2021",
        type: "Full Album",
        tracks: [
          { title: "LOCO", lead: true, yt: "" },
          { title: "#Twenty", yt: "" },
          { title: "Sooo LUCKY", yt: "" },
          { title: "Gas Me Up", yt: "" },
          { title: "SWIPE", yt: "" },
          { title: "Chillin Chillin", yt: "" },
        ],
      },
      {
        title: "CHECKMATE",
        year: "2022",
        type: "EP",
        tracks: [
          { title: "SNEAKERS", lead: true, yt: "Hbb5GPxXF1w" },
          { title: "RACER", yt: "" },
          { title: "Domino", yt: "" },
          { title: "Free Fall", yt: "" },
          { title: "365", yt: "" },
          { title: "Boys Like You", yt: "" },
        ],
      },
      {
        title: "CHESHIRE",
        year: "2022",
        type: "EP",
        tracks: [
          { title: "Cheshire", lead: true, yt: "" },
          { title: "SNOWY", yt: "" },
          { title: "Freaky", yt: "" },
        ],
      },
      {
        title: "KILL MY DOUBT",
        year: "2023",
        type: "EP",
        tracks: [
          { title: "CAKE", lead: true, yt: "" },
          { title: "BET ON ME", yt: "" },
          { title: "None of My Business", yt: "" },
          { title: "Kill Shot", yt: "" },
          { title: "Psychic Lover", yt: "" },
          { title: "Bratty", yt: "" },
        ],
      },
      {
        title: "BORN TO BE",
        year: "2024",
        type: "Full Album",
        tracks: [
          { title: "UNTOUCHABLE", lead: true, yt: "" },
          { title: "BORN TO BE", lead: true, yt: "" },
          { title: "Mr. Vampire", yt: "" },
          { title: "Escalator", yt: "" },
        ],
      },
    ],
  },

  lesserafim: {
    name: "LE SSERAFIM",
    color: "#4d7cff",
    albums: [
      {
        title: "FEARLESS",
        year: "2022",
        type: "EP",
        tracks: [
          { title: "FEARLESS", lead: true, yt: "4vbDFu0PUew" },
          { title: "The Great Mermaid", yt: "" },
          { title: "Blue Flame", yt: "" },
          { title: "Sour Grapes", yt: "" },
        ],
      },
      {
        title: "ANTIFRAGILE",
        year: "2022",
        type: "EP",
        tracks: [
          { title: "ANTIFRAGILE", lead: true, yt: "pyf8cbqyfPs" },
          { title: "Impurities", yt: "" },
          { title: "No Celestial", yt: "" },
          { title: "Good Parts (when the quality is bad but I am)", yt: "" },
        ],
      },
      {
        title: "UNFORGIVEN",
        year: "2023",
        type: "Full Album",
        tracks: [
          { title: "UNFORGIVEN (feat. Nile Rodgers)", lead: true, yt: "" },
          { title: "Eve, Psyche & the Bluebeard's wife", yt: "" },
          { title: "No-Return (Into the unknown)", yt: "" },
          { title: "Fire in the belly", yt: "" },
          { title: "Burn the Bridge", yt: "" },
          { title: "Flash Forward", yt: "" },
        ],
      },
      {
        title: "Perfect Night",
        year: "2023",
        type: "Single",
        tracks: [
          { title: "Perfect Night", lead: true, yt: "" },
        ],
      },
      {
        title: "EASY",
        year: "2024",
        type: "EP",
        tracks: [
          { title: "EASY", lead: true, yt: "" },
          { title: "Smart", yt: "" },
          { title: "Swan Song", yt: "" },
          { title: "We got so much", yt: "" },
        ],
      },
      {
        title: "CRAZY",
        year: "2024",
        type: "EP",
        tracks: [
          { title: "CRAZY", lead: true, yt: "n6B5gQXlB-0" },
          { title: "1-800-hot-n-fun", yt: "" },
          { title: "Pierrot", yt: "" },
          { title: "Chasing Lightning", yt: "" },
        ],
      },
      {
        title: "HOT",
        year: "2025",
        type: "EP",
        tracks: [
          { title: "HOT", lead: true, yt: "" },
        ],
      },
    ],
  },
};

// 舞台标签定义
window.TAGS = {
  stage:  { label: "普通舞台", emoji: "🎤", color: "#8a8f98" },
  float:  { label: "花车",     emoji: "🚗", color: "#ffb020" },
  patrol: { label: "巡场",     emoji: "🏃", color: "#22c55e" },
  fansa:  { label: "饭撒·小舞台", emoji: "🎪", color: "#e879f9" },
};
