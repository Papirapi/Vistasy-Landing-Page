// Tells Bing, Yandex, Seznam and Naver (IndexNow) that the site's pages changed; Bing's index also feeds
// ChatGPT search and Copilot. Run after a deploy that changes content: pnpm indexnow
// The key file public/549c26b31b9dc9636a6cdf2adcaf88ce.txt proves ownership and must stay deployed.
const KEY = "549c26b31b9dc9636a6cdf2adcaf88ce";
const HOST = "www.vistasy.clinic";
const xml = await (await fetch(`https://${HOST}/sitemap.xml`)).text();
const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
});
console.log(`IndexNow: ${res.status} ${res.statusText} for ${urlList.length} URLs`);
process.exit(res.ok ? 0 : 1);
