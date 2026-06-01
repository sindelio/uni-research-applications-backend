import {
  Participant,
  Project,
} from '../../database/models.js';
import setDate from '../../helpers/set-date.js';
import dotifyObject from '../../helpers/dotify.js';
import findOne from '../../helpers/find-one.js';
import find from '../../helpers/find.js';
import paginatedFind from '../../helpers/paginated-find.js';
import getModel from '../_common/helpers/get-model.js';
import commonService from '../_common/common-service.js';
import allocateExaminer from '../_common/helpers/allocate-examiner.js';
import BadRequest from '../../errors/bad-request.js';

const { 
  PROJECT_WAITING_EXAMINER,
  PROJECT_PENDING_REVIEW,
  PROJECT_PARTIALLY_APPROVED,
  PROJECT_APPROVED,
  PROJECT_REJECTED,
} = process.env;

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
  async stats(email) {
    // Projects
    const projects = await Project.find({});

    // Projects waiting examiner
    const projectsWaitingExaminer = projects.filter((project) => {
      if (project.status == PROJECT_WAITING_EXAMINER) {
        return true;
      }
      return false;
    });

    // Projects pending review
    const projectsPendingReview = projects.filter((project) => {
      if (project.status == PROJECT_PENDING_REVIEW) {
        return true;
      }
      return false;
    });

    // Projects partially approved
    const projectsPartiallyApproved = projects.filter((project) => {
      if (project.status == PROJECT_PARTIALLY_APPROVED) {
        return true;
      }
      return false;
    });

    // Projects approved
    const projectsApproved = projects.filter((project) => {
      if (project.status == PROJECT_APPROVED) {
        return true;
      }
      return false;
    });

    // Projects rejected
    const projectsRejected = projects.filter((project) => {
      if (project.status == PROJECT_REJECTED) {
        return true;
      }
      return false;
    });

    // Stats
    const stats = {
      projectsWaitingExaminer: projectsWaitingExaminer.length,
      projectsPendingReview: projectsPendingReview.length,
      projectsPartiallyApproved: projectsPartiallyApproved.length,
      projectsApproved: projectsApproved.length,
      projectsRejected: projectsRejected.length,
    };

    return {
      success: true,
      data: stats,
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
  async uploadReceipt(email, receiptFile64Encoded, nameOnFile) {
    const participant = await findOne(Participant, { email });

    // Check if the receipt file was used by another user
    const participants = await find(Participant, {});
    for (let i = 0; i < participants.length; i++) {
      const currentParticipant = participants[i];
      const currentNameOnFile = currentParticipant.receiptFile.nameOnFile;
      if (currentNameOnFile === nameOnFile) {
        throw new BadRequest('Comprovante de inscrição utilizado por outro participante');
      }
    }

    const cleanBase64 = receiptFile64Encoded.split(';base64,').pop();
    const buffer = Buffer.from(cleanBase64, 'base64');
    participant.receiptFile = {
      data: buffer,
      isSubmitted: true,
      nameOnFile,
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
  async updateProject(email, projectId, update) {
    const project = await findOne(
      Project, 
      { participantEmail: email, _id: projectId },
    );
    update.status = PROJECT_PENDING_REVIEW;
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
