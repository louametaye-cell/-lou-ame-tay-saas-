async function testCreateApi() {
  console.log("Testing POST /api/super-admin/restaurants against local dev server...");
  try {
    const res = await fetch('http://localhost:3000/api/super-admin/restaurants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: "Resto Test Live " + Date.now(),
        subdomain: "restotest" + Math.floor(Math.random() * 1000),
        ownerName: "Test Owner",
        phone: "+221 77 999 99 99",
        address: "Dakar Plateau",
        plan: "PRO",
        months: 3,
        tablesCount: 5
      })
    });

    console.log("Response status:", res.status);
    const data = await res.json();
    console.log("Response body:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

testCreateApi();
