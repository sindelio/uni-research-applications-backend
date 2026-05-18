import {
  Examiner,
  Project,
} from '../../database/models.js';
import findOne from '../../helpers/find-one.js';
import paginatedFind from '../../helpers/paginated-find.js';
import getModel from '../_common/helpers/get-model.js';
import commonService from '../_common/common-service.js';

const {
  PROJECT_PENDING_REVIEW,
  PROJECT_APPROVED,
  PROJECT_REJECTED,
} = process.env;

const service = {
  async create(userInfo) {
    const user = await commonService.createUser(Examiner, userInfo);
    user.areas = [];
    user.maxProjects = 0;
    user.numProjects = 0;
    await user.save();
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
    await commonService.updateUser(Examiner, email, update);
    return {
      success: true,
      data: null,
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
  async stats(email) {
    const projects = await Project.find({ examinerEmail: email });
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
    const stats = {
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
  async reviewProject(email, projectId, acceptance) {
    const project = await findOne(
      Project,
      { examinerEmail: email, _id: projectId },
    );
    project.status = acceptance;
    await project.save();
    return {
      success: true,
      data: null,
      error: null,
    };
  },
};

export default service;
