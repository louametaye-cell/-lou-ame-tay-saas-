// test-paywall-api.mjs
import http from 'http';

function testRequest(path, headers = {}) {
  return new Promise((resolve) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path: path,
        method: 'GET',
        headers: headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({
            path,
            status: res.statusCode,
            body: data ? JSON.parse(data) : null,
          });
        });
      }
    );
    req.on('error', (err) => {
      resolve({ path, status: 'ERROR', error: err.message });
    });
    req.end();
  });
}

async function runTests() {
  console.log('--- TEST 1 : TENTATIVES D INTRUSION API SUR UN COMPTE AUTHENTIFIÉ SOUS PACK TAMBALI (MADIBA) ---');

  const madibaHeaders = {
    'Cookie': 'saas_token=resto_session_tenant_madiba_restau',
  };

  const testsTambali = [
    { url: '/api/tenant/zones?restaurantId=tenant_madiba_restau', headers: madibaHeaders },
    { url: '/api/tenant/waiters?restaurantId=tenant_madiba_restau', headers: madibaHeaders },
    { url: '/api/kitchen/history?restaurantId=madiba-restaurant', headers: { 'Cookie': 'kitchen_role=cook; kitchen_pin=1234' } },
    { url: '/api/pickup/madiba-restaurant', headers: {} },
    { url: '/api/display/madiba-restaurant', headers: {} },
    { url: '/api/tenant/cashiers?restaurantId=tenant_madiba_restau', headers: madibaHeaders },
  ];

  for (const t of testsTambali) {
    const res = await testRequest(t.url, t.headers);
    console.log(`URL: ${res.path}`);
    console.log(`Status: HTTP ${res.status}`);
    console.log(`Paywall Bloqué: ${res.status === 403 ? 'OUI (403 Forbidden ✓)' : 'NON (ÉCHEC)'}`);
    console.log(`Payload:`, JSON.stringify(res.body, null, 2));
    console.log('--------------------------------------------------');
  }

  console.log('\n--- TEST 2 : ACCÈS LÉGITIME SUR UN COMPTE ÉLIGIBLE (HOTEL LAT-DIOR - PACK TERANGA) ---');
  const latDiorHeaders = {
    'Cookie': 'saas_token=resto_session_tenant_hotel_lat_dior',
  };
  const resLatDiorZones = await testRequest('/api/tenant/zones?restaurantId=tenant_hotel_lat_dior', latDiorHeaders);
  console.log(`URL: ${resLatDiorZones.path}`);
  console.log(`Status: HTTP ${resLatDiorZones.status}`);
  console.log(`Accès Autorisé: ${resLatDiorZones.status === 200 ? 'OUI (200 OK ✓)' : 'NON (ÉCHEC)'}`);
  console.log(`Payload zones:`, JSON.stringify(resLatDiorZones.body, null, 2));
  console.log('--------------------------------------------------');
}

runTests();
