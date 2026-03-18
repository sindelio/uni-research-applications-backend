import {
  SuperAdmin,
  Admin,
  Participant,
  Examiner,
  Project,
  ErrorLog,
} from '../../database/models.js';
import jsonWebToken from 'jsonwebtoken';
import getModel from '../_common/helpers/get-model.js';
import setDate from '../../helpers/set-date.js';
import findOne from '../../helpers/find-one.js';
import paginatedFind from '../../helpers/paginated-find.js';
import dotifyObject from '../../helpers/dotify.js';
import commonService from '../_common/common-service.js';
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
    return {
      success: true,
      data: null,
      error: null,
    };
  },
  async paginatedFind(type, query, page = 1) {
    let Model = SuperAdmin;
    if (type === 'Admin') Model = Admin;
    if (type === 'Participant') Model = Participant;
    if (type === 'Examiner') Model = Examiner;
    if (type === 'Project') Model = Project;
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
  async createUser(model, userInfo) {
    const Model = await getModel(model);
    const user = await commonService.createUser(Model, userInfo);
    return {
      success: true,
      data: user,
      error: null,
    };
  },
  async readUser(model, email) {
    const Model = await getModel(model);
    const user = await findOne(Model, { email });
    return {
      success: true,
      data: user,
      error: null,
    };
  },
  async updateUser(model, email, update) {
    const Model = await getModel(model);
    const user = await findOne(Model, { email });
    await setDate(update, 'lastUpdatedAt');
    const dotifiedUpdate = await dotifyObject(update);
    await user.updateOne(dotifiedUpdate);
    return {
      success: true,
      data: user,
      error: null,
    };
  },
  async deleteUser(model, email) {
    const Model = await getModel(model);
    await findOne(Model, { email });
    await Model.deleteOne({ email });
    await Project.deleteMany({ participantEmail: email });
    return {
      success: true,
      data: null,
      error: null,
    };
  },
};

export default service;
