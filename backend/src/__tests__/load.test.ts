import request from 'supertest';
import app from '../index';

// Heavy-load simulation: 100k virtual users hitting a mix of endpoints in batches
// We won't actually spawn 100k concurrent sockets; instead we simulate 100k requests
// in tunable concurrency to avoid exhausting the local OS.

const TOTAL_REQUESTS = 100_000;
const CONCURRENCY = Number(process.env.LOAD_CONCURRENCY || 200); // tweakable
const BATCH = Number(process.env.LOAD_BATCH || 1000); // number of requests per batch

// Endpoints to hit; include lightweight ones primarily
const ROUTES: Array<{ method: 'get' | 'post'; path: string; payload?: any }> = [
  { method: 'get', path: '/health' },
  { method: 'get', path: '/courses' },
  { method: 'get', path: '/content/banners' },
];

async function fireOne(i: number) {
  const pick = ROUTES[i % ROUTES.length];
  if (pick.method === 'get') {
    return request(app)[pick.method](pick.path).expect((res) => {
      if (![200, 304].includes(res.status)) {
        throw new Error(`Unexpected status ${res.status} for ${pick.path}`);
      }
    });
  }
  return request(app)
    [pick.method](pick.path)
    .send(pick.payload || {})
    .set('Content-Type', 'application/json')
    .expect((res) => {
      if (res.status >= 500) throw new Error(`5xx on ${pick.path}`);
    });
}

async function runBatch(start: number, count: number) {
  const tasks: Promise<request.Response>[] = [] as any;
  for (let i = 0; i < count; i++) {
    tasks.push(fireOne(start + i));
    if (tasks.length >= CONCURRENCY) {
      await Promise.all(tasks);
      tasks.length = 0;
    }
  }
  if (tasks.length) await Promise.all(tasks);
}

describe('Load test: simulate 100k active users', () => {
  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    process.env.DISABLE_RATE_LIMIT = '1';
  });

  it(`handles ${TOTAL_REQUESTS.toLocaleString()} requests without disconnects`, async () => {
    const batches = Math.ceil(TOTAL_REQUESTS / BATCH);
    let done = 0;
    for (let b = 0; b < batches; b++) {
      const toRun = Math.min(BATCH, TOTAL_REQUESTS - done);
      // eslint-disable-next-line no-console
      console.log(`Batch ${b + 1}/${batches} - running ${toRun} requests...`);
      await runBatch(done, toRun);
      done += toRun;
    }
  }, 600000);
});
