import {
  Examiner,
  Project,
} from '../../database/models.js';
import findOne from '../../helpers/find-one.js';
import paginatedFind from '../../helpers/paginated-find.js';
import generateHtmlMessage from '../../helpers/generate-html-message.js';
import getModel from '../_common/helpers/get-model.js';
import commonService from '../_common/common-service.js';
import notify from '../../functions/notify.js';
import BadRequest from '../../errors/bad-request.js';

const {
  FRONTEND_URL,
  PROJECT_STATUS_PENDING_REVIEW,
  PROJECT_STATUS_PARTIALLY_APPROVED,
  PROJECT_STATUS_APPROVED,
  PROJECT_STATUS_REJECTED,
} = process.env;

const service = {
  async create(userInfo) {
    const user = await commonService.createUser(Examiner, userInfo);
    user.hasAdminAuthorization = true;
    user.areas = [];
    user.maxProjects = 5;
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
      if (project.status == PROJECT_STATUS_PENDING_REVIEW) {
        return true;
      }
      return false;
    });
    const projectsPartiallyApproved = projects.filter((project) => {
      if (project.status == PROJECT_STATUS_PARTIALLY_APPROVED) {
        return true;
      }
      return false;
    });
    const projectsApproved = projects.filter((project) => {
      if (project.status == PROJECT_STATUS_APPROVED) {
        return true;
      }
      return false;
    });
    const projectsRejected = projects.filter((project) => {
      if (project.status == PROJECT_STATUS_REJECTED) {
        return true;
      }
      return false;
    });
    const stats = {
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
  async paginatedFind(email, model, query, page = 1) {
    const Model = await getModel(model);
    if (Model === Project) {
      query.examinerEmail = email;
    }
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
      { examinerEmail: email, _id: projectId },
    );
    return {
      success: true,
      data: project,
      error: null,
    };
  },
  async evaluateProject(email, projectId, evaluation) {
    const project = await findOne(
      Project,
      { examinerEmail: email, _id: projectId },
    );

    const { title, status, participantEmail } = project;

    if (status !== PROJECT_STATUS_PENDING_REVIEW) {
      throw new BadRequest('Status do projeto não é "Aguardando avaliação"');
    }
    project.status = evaluation.status;
    delete evaluation.status;
    project.evaluation = evaluation;
    await project.save();

    // Notification
    const subject = 'Projeto avaliado';
    const htmlMessage = await generateHtmlMessage(
      'Olá!',
      `Seu projeto - ${title} - foi avaliado! Entre na plataforma para acessar a avaliação:`,
      `${FRONTEND_URL}/app/signin`,
      'Plataforma',
    );
    notify(participantEmail, subject, htmlMessage);

    return {
      success: true,
      data: project,
      error: null,
    };
  },
};

export default service;
