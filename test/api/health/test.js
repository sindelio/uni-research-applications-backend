import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import server from '../../../src/server.js';

const mongod = await MongoMemoryServer.create();
const DB_URI = mongod.getUri();
const TEST_PORT = 5050;
const TEST_URL = `http://localhost:${TEST_PORT}/v1`;

let serverHandler = null;
beforeAll(async () => {
  serverHandler = await server.listen(TEST_PORT, () => {});
});

beforeEach(async () => {
  mongoose.set('strictQuery', false);
  await mongoose.connect(DB_URI);
});

afterEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

afterAll(async () => {
  serverHandler.close();
  mongoose.disconnect();
  mongod.stop();
});

describe('GET /health', () => {
  test('Should return the health of the service', async () => {
    // GIVEN

    // WHEN
    const response = await fetch(`${TEST_URL}/health`, {
      method: 'GET',
    });
    const data = await response.json();

    // THEN
    expect(data).toEqual({
      success: true,
      data: {
        status: 'healthy',
        dbConnectionState: 'connected',
        uptime: expect.any(Number),
      },
      error: null,
    });
  });
});
