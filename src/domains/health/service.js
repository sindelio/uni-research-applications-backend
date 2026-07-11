import mongoose from 'mongoose';

const service = {
  async health() {
    const dbConnectionState = mongoose.connection.readyState;
    if (dbConnectionState === 1) {
      const health = {
        status: 'healthy',
        dbConnectionState: 'connected',
        uptime: process.uptime(),
      };
      return {
        success: true,
        data: health,
        error: null,
      };
    }
    throw new Error('Serviço não saudável');
  },
};

export default service;
