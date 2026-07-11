import service from './service.js';

const controller = {
  async authenticate(req, res) {
    const { email, password } = req.body;
    const result = await service.authenticate(email, password);
    res.status(200).json(result);
  },
  async read(req, res) {
    const { email } = req.user;
    const result = await service.read(email);
    res.status(200).json(result);
  },
  async delete(req, res) {
    const { email } = req.user;
    const result = await service.delete(email);
    res.status(200).json(result);
  },
  async update(req, res) {
    const { email } = req.user;
    const update = req.body;
    const result = await service.update(email, update);
    res.status(200).json(result);
  },
  async stats(_req, res) {
    const result = await service.stats();
    res.status(200).json(result);
  },
  async paginatedFind(req, res) {
    const { model, query, page } = req.body;
    const result = await service.paginatedFind(model, query, page);
    res.status(200).json(result);
  },
  async createAdmin(req, res) {
    const userInfo = req.body;
    const result = await service.createAdmin(userInfo);
    res.status(200).json(result);
  },
  async readAdmin(req, res) {
    const { email } = req.query;
    const result = await service.readAdmin(email);
    res.status(200).json(result);
  },
  async updateAdmin(req, res) {
    const { email } = req.query;
    const update = req.body;
    const result = await service.updateAdmin(email, update);
    res.status(200).json(result);
  },
  async deleteAdmin(req, res) {
    const { email } = req.query;
    const result = await service.deleteAdmin(email);
    res.status(200).json(result);
  },
  async readExaminer(req, res) {
    const { email } = req.query;
    const result = await service.readExaminer(email);
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
  async createSettings(req, res) {
    const result = await service.createSettings();
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
  async deleteSettings(req, res) {
    const result = await service.deleteSettings();
    res.status(200).json(result);
  },
};

export default controller;
