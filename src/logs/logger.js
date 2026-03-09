const logger = {
  async info(message) {
    console.log(message);
  },
  async error(err) {
    console.error ();
    console.error(err);
    console.error();
  },
};

export default logger;
