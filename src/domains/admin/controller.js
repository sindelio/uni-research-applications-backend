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
    const { email, password } = req.body;
    const result = await service.createUser(email, password);
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
  async readRequest(req, res) {
    const { id } = req.query;
    const result = await service.readRequest(id);
    res.status(200).json(result);
  },
  async deleteRequest(req, res) {
    const { id } = req.query;
    const result = await service.deleteRequest(id);
    res.status(200).json(result);
  },
  async createInvoice(req, res) {
    const {
      email,
      month,
      year,
    } = req.body;
    const result = await service.createInvoice(
      email,
      month,
      year,
    );
    res.status(200).json(result);
  },
  async createInvoices(req, res) {
    const { month, year } = req.body;
    const result = await service.createInvoices(month, year);
    res.status(200).json(result);
  },
  async markInvoiceAsPaid(req, res) {
    const { id } = req.query;
    const result = await service.markInvoiceAsPaid(id);
    res.status(200).json(result);
  },
  async readInvoice(req, res) {
    const { id } = req.query;
    const result = await service.readInvoice(id);
    res.status(200).json(result);
  },
  async deleteInvoice(req, res) {
    const { id } = req.query;
    const result = await service.deleteInvoice(id);
    res.status(200).json(result);
  },
  async createLinkedinAccount(req, res) {
    const {
      email,
      password,
      linkedinId,
      locale,
      action,
      cookies,
    } = req.body;
    const result = await service.createLinkedinAccount(
      email,
      password,
      linkedinId,
      locale,
      action,
      cookies
    );
    res.status(200).json(result);
  },
  async readLinkedinAccount(req, res) {
    const { email } = req.query;
    const result = await service.readLinkedinAccount(email);
    res.status(200).json(result);
  },
  async updateLinkedinAccount(req, res) {
    const { email } = req.query;
    const update = req.body;
    const result = await service.updateLinkedinAccount(email, update);
    res.status(200).json(result);
  },
  async deleteLinkedinAccount(req, res) {
    const { email } = req.query;
    const result = await service.deleteLinkedinAccount(email);
    res.status(200).json(result);
  },
  async testLinkedinAccount(req, res) {
    const { email } = req.query;
    const result = await service.testLinkedinAccount(email);
    res.status(200).json(result);
  },
  async testAllLinkedinAccounts(_req, res) {
    const result = await service.testAllLinkedinAccounts();
    res.status(200).json(result);
  },
  async saveAllLinkedinAccountsCookies(_req, res) {
    const result = await service.saveAllLinkedinAccountsCookies();
    res.status(200).json(result);
  },
  async createNewsletter(_req, res) {
    const result = await service.createNewsletter();
    res.status(200).json(result);
  },
};

export default controller;
