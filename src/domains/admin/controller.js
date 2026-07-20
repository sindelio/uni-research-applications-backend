import service from './service.js';

const controller = {
  async confirmEmail(req, res) {
    const { email } = req.body;
    const result = await service.confirmEmail(email);
    res.status(200).json(result);
  },
  async recoverPassword(req, res) {
    const { email } = req.body;
    const result = await service.recoverPassword(email);
    res.status(200).json(result);
  },
  async resetPassword(req, res) {
    const {
      email,
      passwordRecoveryToken,
      newPassword,
    } = req.body;
    const result = await service.resetPassword(
      email,
      passwordRecoveryToken,
      newPassword,
    );
    res.status(200).json(result);
  },
  async authenticate(req, res) {
    const { email, password } = req.body;
    const jwt = await service.authenticate(email, password);
    res.status(200).json(jwt);
  },
  async read(req, res) {
    const { email } = req.user;
    const result = await service.read(email);
    res.status(200).json(result);
  },
  async update(req, res) {
    const { email } = req.user;
    const update = req.body;
    const result = await service.update(email, update);
    res.status(200).json(result);
  },
  async delete(req, res) {
    const { email } = req.user;
    const result = await service.delete(email);
    res.status(200).json(result);
  },
  async stats(req, res) {
    const result = await service.stats();
    res.status(200).json(result);
  },
  async paginatedFind(req, res) {
    const { model, query, page } = req.body;
    const result = await service.paginatedFind(model, query, page);
    res.status(200).json(result);
  },
  async allocateExaminerToProject(req, res) {
    const { projectId } = req.query;
    const { examinerEmail } = req.body;
    const result = await service.allocateExaminerToProject(projectId, examinerEmail);
    res.status(200).json(result);
  },
  async readExaminer(req, res) {
    const { email } = req.query;
    const result = await service.readExaminer(email);
    res.status(200).json(result);
  },
  async readExaminers(req, res) {
    const result = await service.readExaminers();
    res.status(200).json(result);
  },
  async updateExaminer(req, res) {
    const { email } = req.query;
    const update = req.body;
    const result = await service.updateExaminer(email, update);
    res.status(200).json(result);
  },
  async deleteExaminer(req, res) {
    const { email } = req.query;
    const result = await service.deleteExaminer(email);
    res.status(200).json(result);
  },
  async readParticipant(req, res) {
    const { email } = req.query;
    const result = await service.readParticipant(email);
    res.status(200).json(result);
  },
  async updateParticipant(req, res) {
    const { email } = req.query;
    const update = req.body;
    const result = await service.updateParticipant(email, update);
    res.status(200).json(result);
  },
  async deleteParticipant(req, res) {
    const { email } = req.query;
    const result = await service.deleteParticipant(email);
    res.status(200).json(result);
  },
  async readProject(req, res) {
    const { projectId } = req.query;
    const result = await service.readProject(projectId);
    res.status(200).json(result);
  },
  async updateProject(req, res) {
    const { projectId } = req.query;
    const update = req.body;
    const result = await service.updateProject(projectId, update);
    res.status(200).json(result);
  },
  async deleteProject(req, res) {
    const { projectId } = req.query;
    const result = await service.deleteProject(projectId);
    res.status(200).json(result);
  },
  async readSettings(req, res) {
    const result = await service.readSettings();
    res.status(200).json(result);
  },
  async updateSettings(req, res) {
    const update = req.body;
    const result = await service.updateSettings(update);
    res.status(200).json(result);
  },
};

export default controller;
