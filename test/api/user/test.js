import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import {
  User,
  Search,
  Purchase,
} from '../../../src/database/models.js';
import server from '../../../src/server.js';
import {
  USER,
  CREDENTIALS,
  JWT,
  SEARCH,
  PURCHASE,
} from './samples.js';

const mongod = await MongoMemoryServer.create();
const DB_URI = mongod.getUri();
const TEST_PORT = 5052;
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

describe('POST /user', () => {
  test('Should NOT create a user which is already in the database', async () => {
    // GIVEN
    const user = new User(USER);
    await user.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/user`, {
      method: 'POST',
      body: JSON.stringify({
        email: user.email,
        password: user.password,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();

    // THEN
    expect(data).toEqual({
      success: false,
      data: null,
      error: {
        statusCode: 400,
        message: `User ${USER.email} already in database`,
      },
    });
  });
  test('Should NOT create a user with a payment plan', async () => {
    // GIVEN
    const user = new User(USER);
    await user.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/user`, {
      method: 'POST',
      body: JSON.stringify({
        email: USER.email,
        password: USER.password,
        plan: 'Pay ahead',
      }),
      headers: {
        'Content-Type': 'application/json',
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
  test('Should create a user', async () => {
    // GIVEN

    // WHEN
    const response = await fetch(`${TEST_URL}/user`, {
      method: 'POST',
      body: JSON.stringify({
        email: USER.email,
        password: USER.password,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();

    // THEN
    expect(data).toEqual({
      success: true,
      data: {
        email: USER.email,
        password: USER.password,
        name: 'Not set',
        company: 'Not set',
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
  test('Should create an user with name and company "Not set" by default', async () => {
    // GIVEN

    // WHEN
    const response = await fetch(`${TEST_URL}/user`, {
      method: 'POST',
      body: JSON.stringify({
        email: USER.email,
        password: USER.password,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();

    // THEN
    expect(data).toEqual({
      success: true,
      data: {
        email: USER.email,
        password: USER.password,
        name: 'Not set',
        company: 'Not set',
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

describe('POST /user/confirm-email', () => {
  test('Should NOT confirm without an email', async () => {
    // GIVEN
    const email = null;

    // WHEN
    const response = await fetch(`${TEST_URL}/user/confirm-email`, {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: {
        'Content-Type': 'application/json',
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
  test('Should NOT confirm an invalid email', async () => {
    // GIVEN
    const email = 'an invalid email string';

    // WHEN
    const response = await fetch(`${TEST_URL}/user/confirm-email`, {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: {
        'Content-Type': 'application/json',
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
  test('Should NOT confirm if the status is already "Email confirmed"', async () => {
    // GIVEN
    const { email } = USER;
    const user = new User({
      ...USER,
      status: 'Email confirmed',
    });
    await user.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/user/confirm-email`, {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();

    // THEN
    expect(data).toEqual({
      success: false,
      data: null,
      error: {
        statusCode: 400,
        message: `User ${email} already confirmed`,
      },
    });
  });
  test('Should confirm if the status is "Pending email confirmation"', async () => {
    // GIVEN
    const { email } = USER;
    const user = new User({
      ...USER,
      status: 'Pending email confirmation',
    });
    await user.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/user/confirm-email`, {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: {
        'Content-Type': 'application/json',
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

describe('POST /user/recover-password', () => {
  test('Should NOT recover the password without an email', async () => {
    // GIVEN
    const email = null;

    // WHEN
    const response = await fetch(`${TEST_URL}/user/recover-password`, {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: {
        'Content-Type': 'application/json',
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
  test('Should NOT recover the password with an invalid email', async () => {
    // GIVEN
    const email = 'an invalid email string';

    // WHEN
    const response = await fetch(`${TEST_URL}/user/recover-password`, {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: {
        'Content-Type': 'application/json',
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
  test('Should NOT recover the password of a user that has not signed up', async () => {
    // GIVEN
    const { email } = USER;

    // WHEN
    const response = await fetch(`${TEST_URL}/user/recover-password`, {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();

    // THEN
    expect(data).toEqual({
      success: false,
      data: null,
      error: {
        statusCode: 404,
        message: `User ${email} not found in database`,
      },
    });
  });
  test('Should recover the password of a user that has signed up', async () => {
    // GIVEN
    const { email } = USER;
    const user = new User(USER);
    await user.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/user/recover-password`, {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: {
        'Content-Type': 'application/json',
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

describe('POST /user/reset-password', () => {
  test('Should NOT reset with an invalid email, recovery token or password', async () => {
    // GIVEN

    // WHEN
    const response = await fetch(`${TEST_URL}/user/reset-password`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'an invalid email string',
        passwordRecoveryCode: 'nothexadecimalwith16chars',
        newPassword: null,
      }),
      headers: {
        'Content-Type': 'application/json',
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
  test('Should NOT reset with the wrong recovery token', async () => {
    // GIVEN
    const user = new User({
      ...USER,
      passwordRecoveryToken: '0123456789abcdef',
    });
    await user.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/user/reset-password`, {
      method: 'POST',
      body: JSON.stringify({
        email: USER.email,
        passwordRecoveryToken: '0000111122223333',
        newPassword: 'newpassword',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();

    // THEN
    expect(data).toEqual({
      success: false,
      data: null,
      error: {
        statusCode: 400,
        message: 'Incorrect password recovery token',
      },
    });
  });
  test('Should reset with the correct recovery token', async () => {
    // GIVEN
    const user = new User({
      ...USER,
      passwordRecoveryToken: '0123456789abcdef',
    });
    await user.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/user/reset-password`, {
      method: 'POST',
      body: JSON.stringify({
        email: USER.email,
        passwordRecoveryToken: '0123456789abcdef',
        newPassword: 'newpassword',
      }),
      headers: {
        'Content-Type': 'application/json',
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

describe('POST /user/signin', () => {
  test('Should NOT authenticate an user without credentials', async () => {
    // GIVEN
    const user = new User(USER);
    await user.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/user/signin`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'wrongemail@domain.com',
        password: 'wrongpassword',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();

    // THEN
    expect(data).toEqual({
      success: false,
      data: null,
      error: {
        statusCode: 404,
        message: 'User wrongemail@domain.com not found in database',
      },
    });
  });
  test('Should NOT authenticate an user which is not in the database', async () => {
    // GIVEN

    // WHEN
    const response = await fetch(`${TEST_URL}/user/signin`, {
      method: 'POST',
      body: JSON.stringify(CREDENTIALS),
      headers: {
        'Content-Type': 'application/json',
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
  test('Should NOT authenticate an user with the incorrect password', async () => {
    // GIVEN
    const user = new User(USER);
    await user.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/user/signin`, {
      method: 'POST',
      body: JSON.stringify({
        email: USER.email,
        password: 'incorrectpassword',
      }),
      headers: {
        'Content-Type': 'application/json',
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
  test('Should authenticate an user with valid credentials', async () => {
    // GIVEN
    const user = new User(USER);
    await user.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/user/signin`, {
      method: 'POST',
      body: JSON.stringify(CREDENTIALS),
      headers: {
        'Content-Type': 'application/json',
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

describe('GET /user', () => {
  test('Should NOT read an user without a JWT', async () => {
    // GIVEN
    const user = new User(USER);
    await user.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/user`, {
      method: 'GET',
      headers: {
        Authorization: null,
        'Content-Type': 'application/json',
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
  test('Should NOT read an user which is not in the database', async () => {
    // GIVEN

    // WHEN
    const response = await fetch(`${TEST_URL}/user`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
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
  test('Should read an user which is authenticated and in the database', async () => {
    // GIVEN
    await fetch(`${TEST_URL}/user`, {
      method: 'POST',
      body: JSON.stringify({
        email: USER.email,
        password: USER.password,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // WHEN
    const response = await fetch(`${TEST_URL}/user`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();

    // THEN
    expect(data).toEqual({
      success: true,
      data: {
        email: USER.email,
        password: '***',
        name: 'Not set',
        company: 'Not set',
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

describe('PATCH /user', () => {
  test('Should NOT update an user email and plan', async () => {
    // GIVEN
    const user = new User(USER);
    await user.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/user`, {
      method: 'PATCH',
      body: JSON.stringify({
        email: 'newemail@newdomain.com',
        plan: 'New plan',
      }),
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
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

    // WHEN
    const response = await fetch(`${TEST_URL}/user`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: 'Newname',
        password: 'newpassword',
        company: 'New company',
      }),
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
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
  test('Should update an user which is authenticated and in the database', async () => {
    // GIVEN
    const user = new User(USER);
    await user.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/user`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: 'Newname',
        password: 'newpassword',
        company: 'New company',
      }),
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
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

describe('DELETE /user', () => {
  test('Should NOT delete an user which is not in the database', async () => {
    // GIVEN

    // WHEN
    const response = await fetch(`${TEST_URL}/user`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
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
  test('Should delete an user which is authenticated and in the database', async () => {
    // GIVEN
    const user = new User(USER);
    await user.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/user`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
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
  test('Should delete an user with his searches and purchases', async () => {
    // GIVEN
    const user = new User(USER);
    await user.save();
    const search = new Search(SEARCH);
    await search.save();
    const purchase = new Purchase(PURCHASE);
    await purchase.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/user`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();

    // THEN
    const searches = await Search.find({ email: USER.email });
    const purchases = await Purchase.find({ email: USER.email });
    expect(searches).toEqual([]);
    expect(purchases).toEqual([]);
    expect(data).toEqual({
      success: true,
      data: null,
      error: null,
    });
  });
});

describe('GET /user/search', () => {
  test('Should NOT read a negative page', async () => {
    // GIVEN
    const user = new User(USER);
    await user.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/user/search?page=-1`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
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
    const user = new User(USER);
    await user.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/user/search?page=0`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
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
  test('Should read page 1 by default', async () => {
    // GIVEN
    const user = new User(USER);
    await user.save();
    const search = new Search(SEARCH);
    await search.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/user/search`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();

    // THEN
    expect(data).toEqual({
      success: true,
      data: {
        numberOfItems: 1,
        itemsInPage: [SEARCH],
      },
      error: null,
    });
  });
  test('Should read a positive integer page with multiple searches', async () => {
    // GIVEN
    const user = new User(USER);
    await user.save();
    const SEARCH_1 = SEARCH;
    delete SEARCH_1._id;
    const search1 = new Search(SEARCH_1);
    await search1.save();
    const SEARCH_2 = SEARCH;
    delete SEARCH_2._id;
    const search2 = new Search(SEARCH_2);
    await search2.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/user/search?page=1`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();

    // THEN
    expect(data).toEqual({
      success: true,
      data: {
        numberOfItems: 2,
        itemsInPage: [
          {
            ...SEARCH_1,
            _id: expect.any(String),
          },
          {
            ...SEARCH_2,
            _id: expect.any(String),
          },
        ],
      },
      error: null,
    });
  });
  test('Should read an empty page if no searches were made yet', async () => {
    // GIVEN
    const user = new User(USER);
    await user.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/user/search?page=1`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();

    // THEN
    expect(data).toEqual({
      success: true,
      data: {
        numberOfItems: 0,
        itemsInPage: [],
      },
      error: null,
    });
  });
  test('Should read an empty page if the page requested has no searches', async () => {
    // GIVEN
    const user = new User(USER);
    await user.save();
    const search = new Search(SEARCH);
    await search.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/user/search?page=2`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
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

describe('POST /user/purchase', () => {
  test('Should NOT allow purchases of more than 999 searches', async () => {
    // GIVEN
    const user = new User(USER);
    await user.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/user/purchase`, {
      method: 'POST',
      body: JSON.stringify({
        numberOfSearches: 1000,
      }),
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
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
  test('Should NOT allow purchases of less than 1 search', async () => {
    // GIVEN
    const user = new User(USER);
    await user.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/user/purchase`, {
      method: 'POST',
      body: JSON.stringify({
        numberOfSearches: -1,
      }),
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
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
  test('Should NOT allow purchases of a non-integer number of searches', async () => {
    // GIVEN
    const user = new User(USER);
    await user.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/user/purchase`, {
      method: 'POST',
      body: JSON.stringify({
        numberOfSearches: 1.5,
      }),
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
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
  test('Should allow purchases of an integer number of searches between 1 and 999', async () => {
    // GIVEN
    await fetch(`${TEST_URL}/user`, {
      method: 'POST',
      body: JSON.stringify({
        email: USER.email,
        password: USER.password,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // WHEN
    const response = await fetch(`${TEST_URL}/user/purchase`, {
      method: 'POST',
      body: JSON.stringify({
        numberOfSearches: 10,
      }),
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();

    // THEN
    expect(data).toEqual({
      success: true,
      data: {
        stripeCheckoutSessionUrl: expect.stringContaining(
          'https://checkout.stripe.com/c/pay',
        ),
      },
      error: false,
    });
  });
});

describe('GET /user/purchase', () => {
  test('Should NOT read a negative page', async () => {
    // GIVEN
    const user = new User(USER);
    await user.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/user/purchase?page=-1`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
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
    const user = new User(USER);
    await user.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/user/purchase?page=0`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
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
  test('Should read page 1 by default', async () => {
    // GIVEN
    const user = new User(USER);
    await user.save();
    const purchase = new Purchase(PURCHASE);
    await purchase.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/user/purchase`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();

    // THEN
    expect(data).toEqual({
      success: true,
      data: {
        numberOfItems: 1,
        itemsInPage: [
          {
            ...PURCHASE,
            _id: expect.any(String),
            __v: 0,
          },
        ],
      },
      error: null,
    });
  });
  test('Should read a page with multiple purchases', async () => {
    // GIVEN
    const user = new User(USER);
    await user.save();
    const PURCHASE_1 = PURCHASE;
    delete PURCHASE_1._id;
    const purchase1 = new Purchase(PURCHASE_1);
    await purchase1.save();
    const PURCHASE_2 = PURCHASE;
    delete PURCHASE_2._id;
    const purchase2 = new Purchase(PURCHASE_2);
    await purchase2.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/user/purchase?page=1`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();

    // THEN
    expect(data).toEqual({
      success: true,
      data: {
        numberOfItems: 2,
        itemsInPage: [
          {
            ...PURCHASE_1,
            _id: expect.any(String),
            __v: 0,
          },
          {
            ...PURCHASE_2,
            _id: expect.any(String),
            __v: 0,
          },
        ],
      },
      error: null,
    });
  });
  test('Should read an empty page if no purchases were made yet', async () => {
    // GIVEN
    const user = new User(USER);
    await user.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/user/purchase?page=1`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();

    // THEN
    expect(data).toEqual({
      success: true,
      data: {
        numberOfItems: 0,
        itemsInPage: [],
      },
      error: null,
    });
  });
  test('Should read an empty page if the page requested has no purchases', async () => {
    // GIVEN
    const user = new User(USER);
    await user.save();
    const purchase = new Purchase(PURCHASE);
    await purchase.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/user/purchase?page=2`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
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

describe('POST /user/regenerate-api-token', () => {
  test('Should NOT regenerate for an user which is not in the database', async () => {
    // GIVEN

    // WHEN
    const response = await fetch(`${TEST_URL}/user/regenerate-api-token`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
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
  test('Should NOT regenerate without a JWT', async () => {
    // GIVEN
    const user = new User(USER);
    await user.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/user/regenerate-api-token`, {
      method: 'POST',
      headers: {
        Authorization: null,
        'Content-Type': 'application/json',
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
  test('Should regenerate the API token for an user', async () => {
    // GIVEN
    const user = new User(USER);
    await user.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/user/regenerate-api-token`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();

    // THEN
    expect(data).toEqual({
      success: true,
      data: {
        apiToken: expect.any(String),
      },
      error: null,
    });
  });
});

describe('POST /user/support', () => {
  test('Should NOT request support for an user which is not in the database', async () => {
    // GIVEN

    // WHEN
    const response = await fetch(`${TEST_URL}/user/support`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'support',
        message: 'I have an issue',
        videoUrl: 'https://www.youtube.com/',
      }),
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
  test('Should NOT request support without a JWT', async () => {
    // GIVEN
    const user = new User(USER);
    await user.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/user/support`, {
      method: 'POST',
      headers: {
        Authorization: null,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'support',
        message: 'I have an issue',
        videoUrl: 'https://www.youtube.com/',
      }),
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
  test('Should NOT request support with an invalid type, message or videoUrl', async () => {
    // GIVEN
    const user = new User(USER);
    await user.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/user/support`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'some random type',
        message: undefined,
        videoUrl: null,
      }),
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
  test('Should request support for an user', async () => {
    // GIVEN
    const user = new User(USER);
    await user.save();

    // WHEN
    const response = await fetch(`${TEST_URL}/user/support`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'support',
        message: 'I have an issue',
        videoUrl: 'https://www.youtube.com/',
      }),
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
