import {
  SuperAdmin,
  User,
  ErrorLog,
} from '../../database/models.js';
import jsonWebToken from 'jsonwebtoken';
import exists from '../../helpers/exists.js';
import setDate from '../../helpers/set-date.js';
import findOne from '../../helpers/find-one.js';
import find from '../../helpers/find.js';
import paginatedFind from '../../helpers/paginated-find.js';
import generateUser from '../_common/helpers/generate-user.js';
import dotifyObject from '../../helpers/dotify.js';
import generateHtmlMessage from '../../helpers/generate-html-message.js';
import notify from '../../functions/notify.js';
import logger from '../../logs/logger.js';
import NotFound from '../../errors/not-found.js';
import BadRequest from '../../errors/bad-request.js';

const {
  JWT_SECRET,
} = process.env;

const service = {
  async authenticate(email, password) {
    const superAdmin = await findOne(SuperAdmin, { email });
    if (superAdmin?.password !== password) {
      throw new BadRequest('Incorrect password, please try again');
    }
    const options = {
      algorithm: 'HS256',
      expiresIn: '24h',
    };
    const credentials = {
      email,
      password,
    };
    const jwt = await jsonWebToken.sign(
      credentials,
      JWT_SECRET,
      options,
    );
    return {
      success: true,
      data: { jwt },
      error: null,
    };
  },
  async read(email) {
    const superAdmin = await findOne(SuperAdmin, { email });
    return {
      success: true,
      data: superAdmin,
      error: null,
    };
  },
  async update(email, update) {
    const superAdmin = await findOne(SuperAdmin, { email });
    await setDate(update, 'lastUpdatedAt');
    const dotifiedUpdate = await dotifyObject(update);
    await superAdmin.updateOne(dotifiedUpdate);
    return {
      success: true,
      data: null,
      error: null,
    };
  },
  async stats() {
    const users = await find(User, {});
    const userStats = {
      total: {
        combined: users?.length,
        type:{
          admin: users?.filter((user) => user.type === 'admin').length,
          participant: users?.filter((user) => user.type === 'participant').length,
          examiner: users?.filter((user) => user.type === 'examiner').length,
        },
      },
    };
    return {
      success: true,
      data: {
        users: userStats,
      },
      error: null,
    };
  },
  async paginatedFind(type, query, page = 1) {
    let Model = SuperAdmin;
    if (type === 'User') Model = User;
    if (type === 'ErrorLog') Model = ErrorLog;
    const { 
      numberOfItems,
      itemsInPage,
    } = await paginatedFind(
      Model,
      query,
      page,
    );
    return {
      success: true,
      data: {
        numberOfItems,
        itemsInPage,
      },
      error: null,
    };
  },
  async createUser(userInfo) {
    const user = await generateUser(userInfo);
    return {
      success: true,
      data: user,
      error: null,
    };
  },
  async readUser(email) {
    const user = await findOne(User, { email });
    return {
      success: true,
      data: user,
      error: null,
    };
  },
  async updateUser(email, update) {
    const user = await findOne(User, { email });
    await setDate(update, 'lastUpdatedAt');
    const dotifiedUpdate = await dotifyObject(update);
    await user.updateOne(dotifiedUpdate);
    return {
      success: true,
      data: null,
      error: null,
    };
  },
  async deleteUser(email) {
    const user = await findOne( User, { email });
    await User.deleteOne({ email });
    return {
      success: true,
      data: null,
      error: null,
    };
  },
};

export default service;
