import {
  SuperAdmin,
  Admin,
  Participant,
  Examiner,
  Project,
  ErrorLog,
} from '../../database/models.js';
import jsonWebToken from 'jsonwebtoken';
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
  async delete(email) {
    await findOne(SuperAdmin, { email });
    await SuperAdmin.deleteOne({ email });
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
  async createAdmin(userInfo) {
    const user = await commonService.createUser(Admin, userInfo);
    return {
      success: true,
      data: user,
      error: null,
    };
  },
  async readAdmin(email) {
    const user = await findOne(Admin, { email });
    return {
      success: true,
      data: user,
      error: null,
    };
  },
  async updateAdmin(email, update) {
    await commonService.updateUser(Admin, email, update);
    return {
      success: true,
      data: null,
      error: null,
    };
  },
  async deleteAdmin(email) {
    await findOne(Admin, { email });
    await Admin.deleteOne({ email });
    return {
      success: true,
      data: null,
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
