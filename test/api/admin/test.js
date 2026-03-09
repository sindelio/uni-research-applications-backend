import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import {
  Admin,
  User,
} from '../../../src/database/models.js';
import server from '../../../src/server.js';
import {
  ADMIN,
  CREDENTIALS,
  JWT,
  ADMIN_API_KEY,
  USER,
} from './samples.js';

const mongod = await MongoMemoryServer.create();
const DB_URI = mongod.getUri();
const TEST_PORT = 5051;
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

describe('POST /admin/signin', () => {
  test('Should NOT authenticate an admin without credentials', async () => {
    // GIVEN
    const admin = new Admin(ADMIN);
    await admin.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/admin/signin`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'wrongemail@domain.com',
        password: 'wrongpassword',
      }),
      headers: {
        'Content-Type': 'application/json',
        'Admin-Api-Key': ADMIN_API_KEY,
      },
    });
    const data = await response.json();

    // THEN
    expect(data).toEqual({
      success: false,
      data: null,
      error: {
        statusCode: 404,
        message: 'Admin wrongemail@domain.com not found in database',
      },
    });
  });
  test('Should NOT authenticate an admin which is not in the database', async () => {
    // GIVEN

    // WHEN
    const response = await fetch(`${TEST_URL}/admin/signin`, {
      method: 'POST',
      body: JSON.stringify(CREDENTIALS),
      headers: {
        'Content-Type': 'application/json',
        'Admin-Api-Key': ADMIN_API_KEY,
      },
    });
    const data = await response.json();

    // THEN
    expect(data).toEqual({
      success: false,
      data: null,
      error: {
        statusCode: 404,
        message: `Admin ${ADMIN.email} not found in database`,
      },
    });
  });
  test('Should NOT allow access to the admin API without the secret key', async () => {
    // GIVEN
    const admin = new Admin(ADMIN);
    await admin.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/admin/signin`, {
      method: 'POST',
      body: JSON.stringify({
        email: ADMIN.email,
        password: ADMIN.password,
      }),
      headers: {
        'Content-Type': 'application/json',
        'Admin-Api-Key': null,
      },
    });
    const data = await response.json();

    // THEN
    expect(data).toEqual({
      success: false,
      data: null,
      error: {
        statusCode: 401,
        message: 'Unauthorized API access',
      },
    });
  });
  test('Should NOT authenticate an admin with the incorrect password', async () => {
    // GIVEN
    const admin = new Admin(ADMIN);
    await admin.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/admin/signin`, {
      method: 'POST',
      body: JSON.stringify({
        email: ADMIN.email,
        password: 'incorrectpassword',
      }),
      headers: {
        'Content-Type': 'application/json',
        'Admin-Api-Key': ADMIN_API_KEY,
      },
    });
    const data = await response.json();

    // THEN
    expect(data).toEqual({
      success: false,
      data: null,
      error: {
        statusCode: 400,
        message: 'Incorrect password, please try again',
      },
    });
  });
  test('Should authenticate an admin with valid credentials', async () => {
    // GIVEN
    const admin = new Admin(ADMIN);
    await admin.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/admin/signin`, {
      method: 'POST',
      body: JSON.stringify({
        email: ADMIN.email,
        password: ADMIN.password,
      }),
      headers: {
        'Content-Type': 'application/json',
        'Admin-Api-Key': ADMIN_API_KEY,
      },
    });
    const data = await response.json();

    // THEN
    expect(data).toEqual({
      success: true,
      data: {
        jwt: expect.any(String),
      },
      error: null,
    });
  });
});

describe('GET /admin', () => {
  test('Should NOT read an admin without a JWT', async () => {
    // GIVEN
    const admin = new Admin(ADMIN);
    await admin.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/admin`, {
      method: 'GET',
      headers: {
        Authorization: null,
        'Content-Type': 'application/json',
        'Admin-Api-Key': ADMIN_API_KEY,
      },
    });
    const data = await response.json();

    // THEN
    expect(data).toEqual({
      success: false,
      data: null,
      error: {
        statusCode: 401,
        message: 'A JWT or an API token must be provided in the format: "Bearer token"',
      },
    });
  });
  test('Should NOT read an admin which is not in the database', async () => {
    // GIVEN

    // WHEN
    const response = await fetch(`${TEST_URL}/admin`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
        'Admin-Api-Key': ADMIN_API_KEY,
      },
    });
    const data = await response.json();

    // THEN
    expect(data).toEqual({
      success: false,
      data: null,
      error: {
        statusCode: 404,
        message: `Admin ${ADMIN.email} not found in database`,
      },
    });
  });
  test('Should read an admin with a valid JWT', async () => {
    // GIVEN
    const admin = new Admin(ADMIN);
    await admin.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/admin`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
        'Admin-Api-Key': ADMIN_API_KEY,
      },
    });
    const data = await response.json();

    // THEN
    expect(data).toEqual({
      success: true,
      data: {
        email: ADMIN.email,
        password: ADMIN.password,
        name: ADMIN.name,
        _id: expect.any(String),
        __v: 0,
      },
      error: null,
    });
  });
});

describe('PATCH /admin', () => {
  test('Should NOT update an admin email', async () => {
    // GIVEN
    const admin = new Admin(ADMIN);
    await admin.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/admin`, {
      method: 'PATCH',
      body: JSON.stringify({
        email: 'newemail@newdomain.com',
      }),
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
        'Admin-Api-Key': ADMIN_API_KEY,
      },
    });
    const data = await response.json();

    // THEN
    expect(data).toEqual({
      success: false,
      data: null,
      error: {
        statusCode: 500,
        message: 'Validation failed',
      },
    });
  });
  test('Should NOT update an admin which is not in the database', async () => {
    // GIVEN

    // WHEN
    const response = await fetch(`${TEST_URL}/admin`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: 'Newname',
      }),
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
        'Admin-Api-Key': ADMIN_API_KEY,
      },
    });
    const data = await response.json();

    // THEN
    expect(data).toEqual({
      success: false,
      data: null,
      error: {
        statusCode: 404,
        message: `Admin ${ADMIN.email} not found in database`,
      },
    });
  });
  test('Should update an admin', async () => {
    // GIVEN
    const admin = new Admin(ADMIN);
    await admin.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/admin`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: 'Newname',
        password: 'newpassword',
      }),
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
        'Admin-Api-Key': ADMIN_API_KEY,
      },
    });
    const data = await response.json();

    // THEN
    expect(data).toEqual({
      success: true,
      data: {
        acknowledged: true,
        modifiedCount: 1,
        upsertedId: null,
        upsertedCount: 0,
        matchedCount: 1,
      },
      error: null,
    });
  });
});

describe('POST /admin/user', () => {
  test('Should NOT create an user which is already in the database', async () => {
    // GIVEN
    const admin = new Admin(ADMIN);
    await admin.save();
    const user = new User(USER);
    await user.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/admin/user`, {
      method: 'POST',
      body: JSON.stringify({
        email: USER?.email,
        password: USER?.password,
        name: USER?.name,
        company: USER?.company,
        billing: {
          plan: 'Pay ahead',
        },
      }),
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
        'Admin-Api-Key': ADMIN_API_KEY,
      },
    });
    const data = await response.json();

    // THEN
    expect(data).toEqual({
      success: false,
      data: null,
      error: {
        statusCode: 400,
        message: `User ${USER.email} already exists in database`,
      },
    });
  });
  test('Should NOT create an user whose plan it not "Pay ahead"', async () => {
    // GIVEN
    const admin = new Admin(ADMIN);
    await admin.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/admin/user`, {
      method: 'POST',
      body: JSON.stringify({
        email: USER.email,
        password: USER.password,
        name: USER.name,
        company: USER.plan,
        billing: {
          plan: 'Monthly subscription',
        },
      }),
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
        'Admin-Api-Key': ADMIN_API_KEY,
      },
    });
    const data = await response.json();

    // THEN
    expect(data).toEqual({
      success: false,
      data: null,
      error: {
        statusCode: 500,
        message: 'Validation failed',
      },
    });
  });
  test('Should create an user', async () => {
    // GIVEN
    const admin = new Admin(ADMIN);
    await admin.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/admin/user`, {
      method: 'POST',
      body: JSON.stringify({
        email: USER.email,
        password: USER.password,
        name: USER.name,
        company: 'TalentSourcery',
        plan: 'Pay ahead',
      }),
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
        'Admin-Api-Key': ADMIN_API_KEY,
      },
    });
    const data = await response.json();

    // THEN
    expect(data).toEqual({
      success: true,
      data: {
        email: USER.email,
        password: USER.password,
        name: USER.name,
        company: 'TalentSourcery',
        plan: 'Pay ahead',
        credits: 0,
        status: 'Pending email confirmation',
        apiToken: expect.any(String),
        stripeCustomerId: expect.any(String),
        createdAt: {
          readableDate: expect.any(String),
          isoDate: expect.any(String),
        },
        _id: expect.any(String),
        __v: 0,
      },
      error: null,
    });
  });
  test('Should create an user with name and company "Not set" by default', async () => {
    // GIVEN
    const admin = new Admin(ADMIN);
    await admin.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/admin/user`, {
      method: 'POST',
      body: JSON.stringify({
        email: USER.email,
        password: USER.password,
        name: USER.name,
        company: 'TalentSourcery',
        billing: {
          plan: 'Pay ahead',
        },
      }),
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
        'Admin-Api-Key': ADMIN_API_KEY,
      },
    });
    const data = await response.json();

    // THEN
    expect(data).toEqual({
      success: true,
      data: {
        email: USER.email,
        password: USER.password,
        name: USER.name,
        company: 'TalentSourcery',
        status: 'Pending email confirmation',
        apiToken: expect.any(String),
        billing: {
          plan: 'Pay ahead',
          credits: 0,
          stripeCustomerId: expect.any(String),
        },
        createdAt: {
          readableDate: expect.any(String),
          isoDate: expect.any(String),
        },
        _id: expect.any(String),
        __v: 0,
      },
      error: null,
    });
  });
});

describe('GET /admin/user/:email', () => {
  test('Should NOT read an user which is not in the database', async () => {
    // GIVEN
    const admin = new Admin(ADMIN);
    await admin.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/admin/user/${USER.email}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
        'Admin-Api-Key': ADMIN_API_KEY,
      },
    });
    const data = await response.json();

    // THEN
    expect(data).toEqual({
      success: false,
      data: null,
      error: {
        statusCode: 404,
        message: `User ${USER.email} not found in database`,
      },
    });
  });
  test('Should read an user', async () => {
    // GIVEN
    const admin = new Admin(ADMIN);
    await admin.save();
    const user = new User(USER);
    await user.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/admin/user/${USER.email}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
        'Admin-Api-Key': ADMIN_API_KEY,
      },
    });
    const data = await response.json();

    // THEN
    expect(data).toEqual({
      success: true,
      data: {
        email: USER?.email,
        password: USER?.password,
        name: USER?.name,
        company: USER?.company,
        plan: 'Pay ahead',
        credits: 5,
        status: 'Email confirmed',
        apiToken: expect.any(String),
        stripeCustomerId: expect.any(String),
        createdAt: {
          readableDate: expect.any(String),
          isoDate: expect.any(String),
        },
        lastUpdatedAt: {
          readableDate: expect.any(String),
          isoDate: expect.any(String),
        },
        _id: expect.any(String),
        __v: 0,
      },
      error: null,
    });
  });
});

describe('GET /admin/user', () => {
  test('Should NOT read a negative page', async () => {
    // GIVEN
    const admin = new Admin(ADMIN);
    await admin.save();
    const user = new User(USER);
    await user.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/admin/user?page=-1`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
        'Admin-Api-Key': ADMIN_API_KEY,
      },
    });
    const data = await response.json();

    // THEN
    expect(data).toEqual({
      success: false,
      data: null,
      error: {
        statusCode: 500,
        message: 'Validation failed',
      },
    });
  });
  test('Should NOT read page zero', async () => {
    // GIVEN
    const admin = new Admin(ADMIN);
    await admin.save();
    const user = new User(USER);
    await user.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/admin/user?page=0`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
        'Admin-Api-Key': ADMIN_API_KEY,
      },
    });
    const data = await response.json();

    // THEN
    expect(data).toEqual({
      success: false,
      data: null,
      error: {
        statusCode: 500,
        message: 'Validation failed',
      },
    });
  });
  test('Should read a page with multiple users', async () => {
    // GIVEN
    const admin = new Admin(ADMIN);
    await admin.save();
    const user1 = new User(USER);
    await user1.save();
    const user2 = new User({
      email: 'user2@domain.com',
      password: 'password',
    });
    await user2.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/admin/user`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
        'Admin-Api-Key': ADMIN_API_KEY,
      },
    });
    const data = await response.json();

    // THEN
    expect(data).toEqual({
      success: true,
      data: {
        numberOfItems: 2,
        itemsInPage: expect.anything(),
      },
      error: null,
    });
  });
  test('Should read an empty page of users if the page requested is too high', async () => {
    // GIVEN
    const admin = new Admin(ADMIN);
    await admin.save();
    const user = new User(USER);
    await user.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/admin/user?page=2`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
        'Admin-Api-Key': ADMIN_API_KEY,
      },
    });
    const data = await response.json();

    // THEN
    expect(data).toEqual({
      success: true,
      data: {
        numberOfItems: 1,
        itemsInPage: [],
      },
      error: null,
    });
  });
});

describe('PATCH /admin/user/:email', () => {
  test('Should NOT update an user email', async () => {
    // GIVEN
    const admin = new Admin(ADMIN);
    await admin.save();
    const user = new User(USER);
    await user.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/admin/user/${USER.email}`, {
      method: 'PATCH',
      body: JSON.stringify({
        email: 'Newemail@domain.com',
      }),
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
        'Admin-Api-Key': ADMIN_API_KEY,
      },
    });
    const data = await response.json();

    // THEN
    expect(data).toEqual({
      success: false,
      data: null,
      error: {
        statusCode: 500,
        message: 'Validation failed',
      },
    });
  });
  test('Should NOT update an user which is not in the database', async () => {
    // GIVEN
    const admin = new Admin(ADMIN);
    await admin.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/admin/user/${USER.email}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: 'Newname',
        password: 'newpassword',
      }),
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
        'Admin-Api-Key': ADMIN_API_KEY,
      },
    });
    const data = await response.json();

    // THEN
    expect(data).toEqual({
      success: false,
      data: null,
      error: {
        statusCode: 404,
        message: `User ${USER.email} not found in database`,
      },
    });
  });
  test('Should update an user', async () => {
    // GIVEN
    const admin = new Admin(ADMIN);
    await admin.save();
    const user = new User(USER);
    await user.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/admin/user/${USER.email}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: 'Newname',
        password: 'newpassword',
      }),
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
        'Admin-Api-Key': ADMIN_API_KEY,
      },
    });
    const data = await response.json();

    // THEN
    expect(data).toEqual({
      success: true,
      data: null,
      error: null,
    });
  });
});

describe('DELETE /admin/user/:email', () => {
  test('Should NOT delete an user which is not in the database', async () => {
    // GIVEN
    const admin = new Admin(ADMIN);
    await admin.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/admin/user/${USER.email}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
        'Admin-Api-Key': ADMIN_API_KEY,
      },
    });
    const data = await response.json();

    // THEN
    expect(data).toEqual({
      success: false,
      data: null,
      error: {
        statusCode: 404,
        message: `User ${USER.email} not found in database`,
      },
    });
  });
  test('Should delete an user', async () => {
    // GIVEN
    const admin = new Admin(ADMIN);
    await admin.save();
    // The user has to be created via the API because of Stripe
    await fetch(`${TEST_URL}/admin/user`, {
      method: 'POST',
      body: JSON.stringify({
        email: USER.email,
        password: USER.password,
        name: USER.name,
        company: 'TalentSourcery',
        billing: {
          plan: 'Pay ahead',
        },
      }),
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
        'Admin-Api-Key': ADMIN_API_KEY,
      },
    });

    // WHEN
    const response = await fetch(`${TEST_URL}/admin/user/${USER.email}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
        'Admin-Api-Key': ADMIN_API_KEY,
      },
    });
    const data = await response.json();

    // THEN
    expect(data).toEqual({
      success: true,
      data: null,
      error: null,
    });
    // The user API tests already checks if searches and purchases get deleted properly
  });
});
