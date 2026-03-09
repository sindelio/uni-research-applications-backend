function notFoundHandler(_req, res, _next) {
  res.status(404).json({
    success: false,
    data: null,
    error: {
      message: 'This endpoint is not available',
    },
  });
}

export default notFoundHandler;
