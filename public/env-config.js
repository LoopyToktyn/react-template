// This file is for local dev only when using nmp/yarn start.
// Deployed versions should use the env variables provided by the container/platform. See Dockerfile for implementation details.

window._env_ = {
  API_URL: "http://localhost:8080",
  ENABLE_MOCKS: "true"
};
