import {
  Admin,
  Examiner,
  Participant,
  Project,
} from '../../database/models.js';
import setDate from '../../helpers/set-date.js';
import dotifyObject from '../../helpers/dotify.js';
import findOne from '../../helpers/find-one.js';
import paginatedFind from '../../helpers/paginated-find.js';
import getModel from '../_common/helpers/get-model.js';
import commonService from '../_common/common-service.js';

const {
  PROJECT_WAITING_EXAMINER,
  PROJECT_PENDING_REVIEW,
  PROJECT_APPROVED,
  PROJECT_REJECTED,
} = process.env;

const service = {
  async confirmEmail(email) {
    await commonService.confirmEmail(Admin, email);
    return {
      success: true,
      data: null,
      error: null,
    };
  },
  async recoverPassword(email) {
    await commonService.recoverPassword(Admin, email);
    return {
      success: true,
      data: null,
      error: null,
    };
  },
  async resetPassword(email, passwordRecoveryToken, newPassword) {
    await commonService.resetPassword(Admin, email, passwordRecoveryToken, newPassword);
    return {
      success: true,
      data: null,
      error: null,
    };
  },
  async authenticate(email, password) {
    const jwt = await commonService.authenticate(Admin, email, password);
    return {
      success: true,
      data: { jwt },
      error: null,
    };
  },
  async read(email) {
    const admin = await findOne(Admin, { email });
    admin.passwordRecoveryToken = '***';
    return {
      success: true,
      data: admin,
      error: null,
    };
  },
  async update(email, update) {
    await commonService.updateUser(Admin, email, update);
    return {
      success: true,
      data: null,
      error: null,
    };
  },
  async delete(email) {
    await findOne(Admin, { email });
    await Admin.deleteOne({ email });
    return {
      success: true,
      data: null,
      error: null,
    };
  },
  async stats() {
    // Admins
    const admins = await Admin.find({});

    // Examiners
    const examiners = await Examiner.find({});

    // Participants
    const participants = await Participant.find({});

    // Projects
    const projects = await Project.find({});
    const projectsWaitingExaminer = projects.filter((project) => {
      if (project.status == PROJECT_WAITING_EXAMINER) {
        return true;
      }
      return false;
    });
    const projectsPendingReview = projects.filter((project) => {
      if (project.status == PROJECT_PENDING_REVIEW) {
        return true;
      }
      return false;
    });
    const projectsApproved = projects.filter((project) => {
      if (project.status == PROJECT_APPROVED) {
        return true;
      }
      return false;
    });
    const projectsRejected = projects.filter((project) => {
      if (project.status == PROJECT_REJECTED) {
        return true;
      }
      return false;
    });

    // Stats
    const stats = {
      admins: admins.length,
      examiners: examiners.length,
      participants: participants.length,
      projectsWaitingExaminer: projectsWaitingExaminer.length,
      projectsPendingReview: projectsPendingReview.length,
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
  async readExaminer(email) {
    const user = await findOne(Examiner, { email });
    return {
      success: true,
      data: user,
      error: null,
    };
  },
  async updateExaminer(email, update) {
    await commonService.updateUser(Examiner, email, update);
    return {
      success: true,
      data: null,
      error: null,
    };
  },
  async deleteExaminer(email) {
    await findOne(Examiner, { email });
    await Examiner.deleteOne({ email });
    return {
      success: true,
      data: null,
      error: null,
    };
  },
  async readParticipant(email) {
    const user = await findOne(Participant, { email });
    return {
      success: true,
      data: user,
      error: null,
    };
  },
  async updateParticipant(email, update) {
    await commonService.updateUser(Participant, email, update);
    return {
      success: true,
      data: null,
      error: null,
    };
  },
  async deleteParticipant(email) {
    await findOne(Participant, { email });
    await Participant.deleteOne({ email });
    await Project.deleteMany({ participantEmail: email });
    return {
      success: true,
      data: null,
      error: null,
    };
  },
  async readProject(projectId) {
    const project = await findOne(Project, { _id: projectId });
    return {
      success: true,
      data: project,
      error: null,
    };
  },
  async updateProject(projectId, update) {
    const project = await findOne(Project, { _id: projectId });
    await setDate(update, 'lastUpdatedAt');
    const dotifiedUpdate = await dotifyObject(update);
    await project.updateOne(dotifiedUpdate);
    return {
      success: true,
      data: null,
      error: null,
    };
  },
  async deleteProject(projectId) {
    const project = await findOne(Project, { _id: projectId });
    await project.deleteOne();
    return {
      success: true,
      data: null,
      error: null,
    };
  },
};

export default service;
