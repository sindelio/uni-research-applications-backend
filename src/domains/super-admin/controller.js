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
    const {
      type,
      query,
      page,
    } = req.body;
    const result = await service.paginatedFind(
      type,
      query,
      page,
    );
    res.status(200).json(result);
  },
  async createUser(req, res) {
    const userInfo = req.body;
    const result = await service.createUser(userInfo);
    res.status(200).json(result);
  },
  async readUser(req, res) {
    const { email } = req.query;
    const result = await service.readUser(email);
    res.status(200).json(result);
  },
  async updateUser(req, res) {
    const { email } = req.query;
    const update = req.body;
    const result = await service.updateUser(email, update);
    res.status(200).json(result);
  },
  async deleteUser(req, res) {
    const { email } = req.query;
    const result = await service.deleteUser(email);
    res.status(200).json(result);
  },
};

export default controller;
