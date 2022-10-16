const registerService = (name, initFn) => {
  if (process.env.NODE_ENV === "development") {
    if (!(name in global)) {
      global[name] = initFn();
    }
    return global[name];
  }
  return initFn();
};

module.exports = registerService;
