// src/config/servicesConfig.ts

import { mockAuthService } from "@api/mock/mockAuthService";
import { authService as realAuthService } from "@api/authService";
import { AuthService } from "@context/AuthContext";

// import { mockPaymentService } from "@api/mock/mockPaymentService";
// import { paymentService as realPaymentService } from "@api/paymentService";
// import { PaymentService } from "@api/paymentService.types";

// Global toggle
const ENABLE_MOCKS = window._env_?.ENABLE_MOCKS === "true";

// 1. Define the config declaratively — no logic here
const serviceRegistry = {
  auth: {
    useMock: true,
    mock: mockAuthService,
    real: realAuthService,
  },
  // payments: {
  //   useMock: false,
  //   mock: mockPaymentService,
  //   real: realPaymentService,
  // },
  // etc...
};

// 2. Build the actual `services` object automatically
const buildServices = <T extends Record<string, any>>(registry: {
  [K in keyof T]: { useMock: boolean; mock: T[K]; real: T[K] };
}): { [K in keyof T]: T[K] } => {
  const result: Partial<{ [K in keyof T]: T[K] }> = {};

  for (const key in registry) {
    const { useMock, mock, real } = registry[key];
    result[key] = ENABLE_MOCKS && useMock ? mock : real;
  }

  return result as { [K in keyof T]: T[K] };
};

// 3. Export the final map of services
export const services = buildServices(serviceRegistry);
