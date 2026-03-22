import service from './service.js';

const controller = {
  async create(req, res) {
    const userInfo = req.body;
    const result = await service.create(userInfo);
    res.status(200).json(result);
  },
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
    const { email } = req.user;
    const { year, month, day } = req.body;
    const result = await service.stats(email, year, month, day);
    res.status(200).json(result);
  },
  async paginatedFind(req, res) {
    const { email } = req.user;
    const { model, query, page } = req.body;
    query.email = email;
    const result = await service.paginatedFind(model, query, page);
    res.status(200).json(result);
  },
  async createProject(req, res) {
    const { email } = req.user;
    const projectInfo = req.body;
    const result = await service.createProject(email, projectInfo);
    res.status(200).json(result);
  },
  async readProject(req, res) {
    const { email } = req.user;
    const { id } = req.query;
    const result = await service.readProject(email, id);
    res.status(200).json(result);
  },
  async readProjects(req, res) {
    const { email } = req.user;
    const result = await service.readProjects(email);
    res.status(200).json(result);
  },
  async updateProject(req, res) {
    const { email } = req.user;
    const { id } = req.query;
    const update = req.body;
    const result = await service.updateProject(email, id, update);
    res.status(200).json(result);
  },
  async deleteProject(req, res) {
    const { email } = req.user;
    const { id } = req.query;
    const result = await service.deleteProject(email, id);
    res.status(200).json(result);
  },
};

export default controller;
