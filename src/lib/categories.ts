export type CategoryMeta = { slug: string; name: string; emoji: string; description: string; claim: string };

export const CATEGORIES: CategoryMeta[] = [
  { slug: "india", name: "India", emoji: "🇮🇳", description: "Who deserves the top spot?", claim: "I'M INDIA'S #1" },
  { slug: "chai", name: "Chai", emoji: "☕", description: "India's real national leaderboard.", claim: "I'M THE BIGGEST CHAI LOVER" },
  { slug: "food", name: "Food", emoji: "🍕", description: "Who eats the most, pays the most?", claim: "I EAT THE MOST" },
  { slug: "cricket", name: "Cricket", emoji: "🏏", description: "The only sport that matters here.", claim: "I'M THE BIGGEST CRICKET FAN" },
  { slug: "bollywood", name: "Bollywood", emoji: "🎬", description: "Lights, camera, outbid.", claim: "I KNOW BOLLYWOOD BEST" },
  { slug: "gaming", name: "Gaming", emoji: "🎮", description: "Respawn at #2. Or don't.", claim: "I'M THE TOP GAMER" },
  { slug: "developers", name: "Developers", emoji: "💻", description: "git push --force your way to #1.", claim: "I'M THE TOP DEVELOPER" },
  { slug: "creators", name: "Creators", emoji: "📸", description: "Content is king. So is cash.", claim: "I'M THE TOP CREATOR" },
  { slug: "colleges", name: "Colleges", emoji: "🏫", description: "Bragging rights, now billable.", claim: "MY COLLEGE IS THE BEST" },
  { slug: "startups", name: "Startups", emoji: "🚀", description: "Burn rate: your dignity.", claim: "I'M THE TOP FOUNDER" },
  { slug: "meme", name: "Meme", emoji: "😂", description: "Peak comedy, paid for.", claim: "I'M THE BIGGEST MEME LORD" },
  { slug: "music", name: "Music", emoji: "🎵", description: "Top of the charts, literally.", claim: "I HAVE THE BEST TASTE IN MUSIC" },
];

export function getCategoryMeta(slug: string): CategoryMeta {
  return CATEGORIES.find((c) => c.slug === slug) ?? { slug, name: slug, emoji: "🏆", description: "", claim: `I'M #1 IN ${slug.toUpperCase()}` };
}
