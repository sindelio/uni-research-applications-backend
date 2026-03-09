class Timeout extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 504;
  }
}

export default Timeout;
