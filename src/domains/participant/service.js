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
import allocateExaminer from '../_common/helpers/allocate-examiner.js';

const { PROJECT_WAITING_EXAMINER } = process.env;

const service = {
  async create(userInfo) {
    const user = await commonService.createUser(Participant, userInfo);
    user.receiptFile = {
      data: null,
      isSubmitted: false,
    };
    await user.save();
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
    const participant = await findOne(Participant, { email });
    participant.passwordRecoveryToken = '***';
    return {
      success: true,
      data: participant,
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
    if (Model === Project) {
      query.participantEmail = query.email;
      delete query.email;
    }
    const { numberOfItems, itemsInPage } = await paginatedFind(Model, query, page);
    return {
      success: true,
      data: {
        numberOfItems,
        itemsInPage,
      },
      error: null,
    };
  },
  async uploadReceipt(email, receiptFile64Encoded) {
    const participant = await findOne(Participant, { email });
    const cleanBase64 = receiptFile64Encoded.split(';base64,').pop();
    const buffer = Buffer.from(cleanBase64, 'base64');
    participant.receiptFile = {
      data: buffer,
      isSubmitted: true,
    };
    await participant.save();
    return {
      success: true,
      data: participant.receiptFile,
      error: null,
    };
  },
  async createProject(email, projectInfo) {
    const { title } = projectInfo;
    let project = await findOne(Project, { title }, true);
    const { bannerFile64Encoded, ...otherInfo } = projectInfo;
    const cleanBase64 = bannerFile64Encoded.split(';base64,').pop();
    const buffer = Buffer.from(cleanBase64, 'base64');
    project = new Project({
      ...otherInfo,
      bannerFile: {
        data: buffer, 
        isSubmitted: true,
      },
      participantEmail: email,
      status: PROJECT_WAITING_EXAMINER,
    });
    await setDate(project, 'createdAt');
    await allocateExaminer(project);
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
