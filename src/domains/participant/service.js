import {
  Participant,
  Project,
} from '../../database/models.js';
import setDate from '../../helpers/set-date.js';
import dotifyObject from '../../helpers/dotify.js';
import findOne from '../../helpers/find-one.js';
import paginatedFind from '../../helpers/paginated-find.js';
import getModel from '../_common/helpers/get-model.js';
import commonService from '../_common/common-service.js';

const service = {
  async create(userInfo) {
    const user = await commonService.createUser(Participant, userInfo);
    return {
      success: true,
      data: user,
      error: null,
    };
  },
  async confirmEmail(email) {
    await commonService.confirmEmail(Participant, email);
    return {
      success: true,
      data: null,
      error: null,
    };
  },
  async recoverPassword(email) {
    await commonService.recoverPassword(Participant, email);
    return {
      success: true,
      data: null,
      error: null,
    };
  },
  async resetPassword(email, passwordRecoveryToken, newPassword) {
    await commonService.resetPassword(Participant, email, passwordRecoveryToken, newPassword);
    return {
      success: true,
      data: null,
      error: null,
    };
  },
  async authenticate(email, password) {
    const jwt = await commonService.authenticate(Participant, email, password);
    return {
      success: true,
      data: { jwt },
      error: null,
    };
  },
  async read(email) {
    const admin = await findOne(Participant, { email });
    admin.passwordRecoveryToken = '***';
    return {
      success: true,
      data: admin,
      error: null,
    };
  },
  async update(email, update) {
    await commonService.updateUser(Participant, email, update);
    return {
      success: true,
      data: null,
      error: null,
    };
  },
  async delete(email) {
    await findOne(Participant, { email });
    await Participant.deleteOne({ email });
    await Project.deleteMany({ participantEmail: email });
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
  async createProject(email, projectInfo) {
    const { title } = projectInfo;
    let project = await findOne(Project, { title }, true);
    project = new Project({
      ...projectInfo,
      participantEmail: email,
      examinerEmail: null,
      status: 'Pending review',
    });
    await setDate(project, 'createdAt');
    await project.save();
    return {
      success: true,
      data:  project,
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
      data: project,
      error: null,
    };
  },
  async readProjects(email) {
    const projects = await Project.find({ participantEmail: email });
    return {
      success: true,
      data: projects,
      error: null,
    };
  },
  async updateProject(email, projectId, update) {
    const project = await findOne(
      Project,
      { participantEmail: email, _id: projectId },
    );
    await setDate(update, 'lastUpdatedAt');
    const dotifiedUpdate = await dotifyObject(update);
    await project.updateOne(dotifiedUpdate);
    return {
      success: true,
      data: project,
      error: null,
    };
  },
  async deleteProject(email, projectId) {
    const project = await findOne(
      Project,
      { participantEmail: email, _id: projectId },
    );
    await project.deleteOne();
    return {
      success: true,
      data: null,
      error: null,
    };
  },
};

export default service;
