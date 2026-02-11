const umbracoConfig = {
  environment: {
    baseUrl: process.env.URL || "https://localhost:44369"
  },
  user: {
    login: process.env.UMBRACO_USER_LOGIN,
    password: process.env.UMBRACO_USER_PASSWORD
  }
};

export { umbracoConfig };
