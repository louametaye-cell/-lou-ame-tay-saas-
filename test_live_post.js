async function testLiveApi() {
  console.log("Testing POST against Vercel Production...");
  try {
    const res = await fetch('https://www.louametay.com/api/super-admin/restaurants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: "Test Production " + Date.now(),
        subdomain: "testprod" + Math.floor(Math.random() * 1000),
        ownerName: "Super Admin",
        phone: "+221 77 111 22 33",
        address: "Dakar",
        plan: "PRO",
        months: 3,
        tablesCount: 5
      })
    });

    console.log("Production Response status:", res.status);
    const data = await res.json();
    console.log("Production Response body:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

testLiveApi();
