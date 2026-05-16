/**
 * k6 load test — POST /v1/optimize
 *
 * Run:
 *   k6 run load-tests/optimize.js
 *   k6 run --vus 20 --duration 60s load-tests/optimize.js
 *   BASE_URL=https://packoptimize-api.fly.dev k6 run load-tests/optimize.js
 *
 * Requires k6: https://k6.io/docs/getting-started/installation/
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const optimizeDuration = new Trend('optimize_duration_ms');

export const options = {
  stages: [
    { duration: '10s', target: 5 },   // ramp up
    { duration: '30s', target: 10 },  // sustained load
    { duration: '10s', target: 0 },   // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],  // 95% of requests under 3s (CPU-bound)
    http_req_failed: ['rate<0.01'],     // <1% failure rate
    errors: ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

/**
 * setup() runs once before all VUs. Logs in, fetches item + box IDs.
 * Return value is passed to default() as `data`.
 */
export function setup() {
  const loginRes = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({
      email: 'admin@swiftship.com',
      password: 'password123',
      tenantSlug: 'swiftship',
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );

  check(loginRes, { 'login 200': (r) => r.status === 200 });
  if (loginRes.status !== 200) {
    throw new Error(`Login failed: ${loginRes.status} ${loginRes.body}`);
  }

  const cookies = loginRes.cookies;
  if (!cookies.access_token || !cookies.access_token[0]) {
    throw new Error('No access_token cookie in login response');
  }
  const cookie = `access_token=${cookies.access_token[0].value}`;

  const headers = {
    'Content-Type': 'application/json',
    Cookie: cookie,
  };

  // Fetch items
  const itemsRes = http.get(`${BASE_URL}/items?limit=10`, { headers });
  check(itemsRes, { 'items 200': (r) => r.status === 200 });
  const items = JSON.parse(itemsRes.body);

  // Fetch box types
  const boxRes = http.get(`${BASE_URL}/box-types?limit=5`, { headers });
  check(boxRes, { 'box-types 200': (r) => r.status === 200 });
  const boxTypes = JSON.parse(boxRes.body);

  if (!items.length || !boxTypes.length) {
    throw new Error('Seed data missing — run: npm run seed in packoptimize-api');
  }

  return {
    cookie,
    // Use first 3 items with qty 1 and all available box types
    itemIds: items.slice(0, 3).map((i) => i.id),
    boxTypeIds: boxTypes.map((b) => b.id),
  };
}

export default function (data) {
  const payload = JSON.stringify({
    items: data.itemIds.map((id) => ({ itemId: id, quantity: 1 })),
    boxTypeIds: data.boxTypeIds,
    algorithm: 'BEST_FIT',
    carriers: ['FEDEX', 'UPS'],
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      Cookie: data.cookie,
    },
  };

  const start = Date.now();
  const res = http.post(`${BASE_URL}/v1/optimize`, payload, params);
  optimizeDuration.add(Date.now() - start);

  const ok = check(res, {
    'status 200 or 201': (r) => r.status === 200 || r.status === 201,
    'has packedBoxes': (r) => {
      try {
        return JSON.parse(r.body).packedBoxes !== undefined;
      } catch {
        return false;
      }
    },
  });

  errorRate.add(!ok);

  sleep(1);
}
