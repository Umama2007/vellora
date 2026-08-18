async function testUrl(label: string, url: string) {
  console.log(`\n--- ${label} (${url}) ---`);
  try {
    const res = await fetch(url);
    const json = await res.json();
    if (json.success && json.data) {
      const posts = json.data.posts || [];
      console.log(`Success: true, posts count: ${posts.length}`);
      posts.forEach((p: any) => {
        console.log(` - Post: "${p.title}" by @${p.author.username} (Category: ${p.category}, Likes: ${p.likeCount})`);
      });
    } else {
      console.log("Failed response:", json);
    }
  } catch (err: any) {
    console.error("Error:", err.message);
  }
}

async function main() {
  await testUrl("1. Dashboard For You", "http://localhost:4000/api/posts?sort=latest&limit=12");
  await testUrl("2. Explore All", "http://localhost:4000/api/posts?category=All&sort=latest&limit=24");
  await testUrl("3. Explore Life", "http://localhost:4000/api/posts?category=Life&sort=latest&limit=24");
  await testUrl("4. Trending", "http://localhost:4000/api/posts?sort=top&limit=20");
  await testUrl("5. Search", "http://localhost:4000/api/search?q=Why+I+Built+Vellora");
}

main();
