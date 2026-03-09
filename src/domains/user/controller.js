import service from './service.js';

const controller = {
  async create(req, res) {
    const { email, password } = req.body;
    const result = await service.create(email, password);
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
  async paginatedFind(req, res) {
    const { email } = req.user;
    const {
      type,
      query,
      page,
    } = req.body;
    query.email = email;
    const result = await service.paginatedFind(
      type,
      query,
      page,
    );
    res.status(200).json(result);
  },
  async readRequest(req, res) {
    const { email } = req.user;
    const { id } = req.query;
    const result = await service.readRequest(email, id);
    res.status(200).json(result);
  },
  async payInvoice(req, res) {
    const { email } = req.user;
    const { id } = req.body;
    const result = await service.payInvoice(email, id);
    res.status(200).json(result);
  },
  async readInvoice(req, res) {
    const { email } = req.user;
    const { id } = req.query;
    const result = await service.readInvoice(email, id);
    res.status(200).json(result);
  },
  async stats(req, res) {
    const { email } = req.user;
    const { year, month, day } = req.body;
    const result = await service.stats(email, year, month, day);
    res.status(200).json(result);
  },
  async regenerateApiKey(req, res) {
    const { email } = req.user;
    const result = await service.regenerateApiKey(email);
    res.status(200).json(result);
  },
  async requestSupport(req, res) {
    const { email } = req.user;
    const {
      type,
      message,
      videoUrl,
    } = req.body;
    const result = await service.requestSupport(
      email,
      type,
      message,
      videoUrl,
    );
    res.status(200).json(result);
  },
};

export default controller;
