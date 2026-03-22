import {
  Participant,
  Examiner,
  Project,
} from '../../database/models.js';
import findOne from '../../helpers/find-one.js';
import paginatedFind from '../../helpers/paginated-find.js';
import getModel from '../_common/helpers/get-model.js';
import commonService from '../_common/common-service.js';

const service = {
  async create(userInfo) {
    const user = await commonService.createUser(Examiner, userInfo);
    return {
      success: true,
      data: user,
      error: null,
    };
  },
  async confirmEmail(email) {
    await commonService.confirmEmail(Examiner, email);
    return {
      success: true,
      data: null,
      error: null,
    };
  },
  async recoverPassword(email) {
    await commonService.recoverPassword(Examiner, email);
    return {
      success: true,
      data: null,
      error: null,
    };
  },
  async resetPassword(email, passwordRecoveryToken, newPassword) {
    await commonService.resetPassword(Examiner, email, passwordRecoveryToken, newPassword);
    return {
      success: true,
      data: null,
      error: null,
    };
  },
  async authenticate(email, password) {
    const jwt = await commonService.authenticate(Examiner, email, password);
    return {
      success: true,
      data: { jwt },
      error: null,
    };
  },
  async read(email) {
    const admin = await findOne(Examiner, { email });
    admin.passwordRecoveryToken = '***';
    return {
      success: true,
      data: admin,
      error: null,
    };
  },
  async update(email, update) {
    const user = await commonService.updateUser(Examiner, email, update);
    return {
      success: true,
      data: user,
      error: null,
    };
  },
  async delete(email) {
    await findOne(Examiner, { email });
    await Examiner.deleteOne({ email });
    return {
      success: true,
      data: null,
      error: null,
    };
  },
  async stats(email, year, month, day) {
    return {
      success: true,
      data: null,
      error: null,
    };
  },
  async paginatedFind(model, query, page = 1) {
    const Model = await getModel(model);
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
  async readProject(email, projectId) {
    const project = await findOne(
      Project,
      { participantEmail: email, _id: projectId },
    );
    return {
      success: true,
      data: {
        project,
      },
      error: null,
    };
  },
};

export default service;
