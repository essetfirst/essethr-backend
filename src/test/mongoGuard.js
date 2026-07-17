const mongoAvailable = () => global.__MONGO_AVAILABLE__ === true;

const skipIfNoMongo = () => {
  if (!mongoAvailable()) {
    // eslint-disable-next-line jest/no-jasmine-globals
    pending("MongoDB not available");
  }
};

module.exports = { mongoAvailable, skipIfNoMongo };
