import {
  Admin,
  Settings,
  Examiner,
  Participant,
  Project,
} from '../../database/models.js';
import setDate from '../../helpers/set-date.js';
import dotifyObject from '../../helpers/dotify.js';
import findOne from '../../helpers/find-one.js';
import find from '../../helpers/find.js';
import paginatedFind from '../../helpers/paginated-find.js';
import generateHtmlMessage from '../../helpers/generate-html-message.js';
import getModel from '../_common/helpers/get-model.js';
import commonService from '../_common/common-service.js';
import notify from '../../functions/notify.js';
import BadRequest from '../../errors/bad-request.js';

const {
  FRONTEND_URL,
  PROJECT_STATUS_WAITING_EXAMINER,
  PROJECT_STATUS_PENDING_REVIEW,
  PROJECT_STATUS_PARTIALLY_APPROVED,
  PROJECT_STATUS_APPROVED,
  PROJECT_STATUS_REJECTED,
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
      if (project.status == PROJECT_STATUS_WAITING_EXAMINER) {
        return true;
      }
      return false;
    });
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

    // Stats
    const stats = {
      admins: admins.length,
      examiners: examiners.length,
      participants: participants.length,
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
  async allocateExaminerToProject(projectId, examinerEmail) {
    // Get project
    const project = await findOne(
      Project,
      { _id: projectId },
    );

    // Check status
    if (project.status !== PROJECT_STATUS_WAITING_EXAMINER) {
      throw new BadRequest('Status do projeto não é "Aguardando avaliador"');
    }

    // Check examiner existence
    const examiner = await findOne(Examiner, { email: examinerEmail });

    // Check max projects
    const { numProjects, maxProjects } = examiner;
    if (numProjects >= maxProjects) {
      throw new BadRequest(
        `Avaliador ${examinerEmail} já está em sua capacidade máxima de avaliação.
        Considere alocar outro avaliador
      `);
    }

    // Update project
    project.examinerEmail = examinerEmail;
    project.status = PROJECT_STATUS_PENDING_REVIEW;
    await project.save();

    // Update examiner
    examiner.numProjects += 1;
    await examiner.save();

    // Notification
    const subject = 'Projeto recebido para avaliação';
    const htmlMessage = await generateHtmlMessage(
      'Olá!',
      'Você recebeu um projeto para avaliação! Acesse a plataforma do ENPCV para avaliá-lo:',
      `${FRONTEND_URL}/app/signin`,
      'Plataforma',
    );
    notify(examinerEmail, subject, htmlMessage);
    return {
      success: true,
      data: project,
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
  async readExaminers(email) {
    const users = await find(Examiner, {});
    return {
      success: true,
      data: users,
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
  async readSettings(projectId) {
    const settings = await findOne(Settings, {});
    return {
      success: true,
      data: settings,
      error: null,
    };
  },
  async updateSettings(update) {
    const settings = await findOne(Settings, {});
    await setDate(update, 'lastUpdatedAt');
    const dotifiedUpdate = await dotifyObject(update);
    await settings.updateOne(dotifiedUpdate);
    return {
      success: true,
      data: null,
      error: null,
    };
  },
};

export default service;
