function notFoundHandler(_req, res, _next) {
  res.status(404).json({
    success: false,
    data: null,
    error: {
      message: 'Esta rota não está disponível',
    },
  });
}

export default notFoundHandler;
