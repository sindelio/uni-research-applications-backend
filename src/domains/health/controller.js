import service from './service.js';

const controller = {
  async health(_req, res) {
    const result = await service.health();
    res.status(200).json(result);
  },
};

export default controller;
