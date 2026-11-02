import { apiRequest } from "./apiRequest";

type RequestEmailChangeBody = {
  email: string;
  password: string;
};

type VerifyEmailChangeBody = {
  email: string;
  code: string;
};

export const changePassword = (body: {
  currentPassword: string;
  newPassword: string;
}) =>
  apiRequest<{ success: true }>("/api/auth/password", {
    method: "PATCH",
    body: JSON.stringify(body),
  });

export const checkEmail = (email: string, signal?: AbortSignal) =>
  apiRequest<{ available: boolean }>(
    `/api/auth/email-available?email=${encodeURIComponent(email)}`,
    { signal },
  );

export const requestEmailChange = (body: RequestEmailChangeBody) =>
  apiRequest<{ success: boolean; message: string; email: string }>(
    "/api/auth/change-email/request",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );

export const verifyEmailChange = (body: VerifyEmailChangeBody) =>
  apiRequest<{ success: boolean; message: string; email: string }>(
    "/api/auth/change-email/verify",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );

export const resendCode = (body: { email: string }) =>
  apiRequest<{ success: boolean; message: string; email: string }>(
    "/api/auth/change-email/resend-code",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
