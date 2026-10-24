import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

import { API_BASE_URL } from "@/constants/config";
import { ROUTES } from "@/constants/routes";
import { authStore } from "@/store/auth-store";
import type { ApiErrorEnvelope, ApiSuccessEnvelope, ApiError } from "@/types/api";
import type { RefreshTokenResponse } from "@/types/auth";

/**
 * Auth strategy (documented here since this is the one file every request
 * flows through):
 *
 * The frontend is a pure SPA-style client calling a separate API origin, so
 * we can't rely on the backend setting httpOnly cookies scoped to this app's
 * origin without extra CORS/cookie-domain plumbing. Instead:
 *
 *  - Access + refresh tokens are both kept in the Zustand `auth-store`,
 *    persisted to `localStorage` (see store/auth-store.ts).
 *  - Every request attaches `Authorization: Bearer <accessToken>` via the
 *    request interceptor below.
 *  - On a 401, we attempt exactly ONE silent refresh via `POST /auth/refresh`
 *    and retry the original request once with the new access token. If the
 *    refresh itself fails, we clear the session and hard-redirect to
 *    `/auth/login`.
 *
 * Trade-off: tokens in localStorage are readable by any JS on the page
 * (XSS risk) vs. httpOnly cookies. Given the separate-origin constraint and
 * that this mirrors what most SPA/API pairs do in practice, this is the
 * pragmatic choice for now. If the backend team later exposes a
 * same-site-friendly cookie flow (e.g. via a BFF/proxy), this file is the
 * only place that needs to change.
 */

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { accessToken } = authStore.getState();
  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }
  return config;
});

/** Marks a request config so we don't attempt to refresh+retry it more than once. */
interface RetryableRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

// Ensures concurrent 401s trigger a single in-flight refresh call instead of
// a refresh-storm, and lets every queued request await the same promise.
let refreshPromise: Promise<RefreshTokenResponse> | null = null;

async function refreshAccessToken(): Promise<RefreshTokenResponse> {
  const { refreshToken } = authStore.getState();
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  // Use a bare axios call (not `apiClient`) to avoid recursing through these
  // same interceptors.
  const response = await axios.post<ApiSuccessEnvelope<RefreshTokenResponse>>(
    `${API_BASE_URL}/auth/refresh`,
    { refreshToken }
  );

  return response.data.data;
}

function forceLogoutAndRedirect() {
  authStore.getState().logout();
  if (typeof window !== "undefined") {
    window.location.href = ROUTES.login;
  }
}

function normalizeError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as ApiErrorEnvelope | undefined;
    const rawMessage = payload?.message;
    return {
      statusCode: payload?.statusCode ?? error.response?.status ?? 0,
      message: Array.isArray(rawMessage)
        ? rawMessage.join(", ")
        : rawMessage ?? error.message ?? "Something went wrong",
      error: payload?.error ?? error.code ?? "UnknownError",
      path: payload?.path,
      timestamp: payload?.timestamp,
    };
  }

  return {
    statusCode: 0,
    message: error instanceof Error ? error.message : "Something went wrong",
    error: "UnknownError",
  };
}

apiClient.interceptors.response.use(
  // Success responses are wrapped as { success: true, data: <payload> }.
  // Unwrap so callers just get <payload>.
  (response) => {
    const body = response.data as ApiSuccessEnvelope<unknown> | unknown;
    if (
      body &&
      typeof body === "object" &&
      "success" in body &&
      "data" in body
    ) {
      return { ...response, data: (body as ApiSuccessEnvelope<unknown>).data };
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    const isAuthEndpoint =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/refresh") ||
      originalRequest?.url?.includes("/auth/register") ||
      originalRequest?.url?.includes("/auth/google");

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      try {
        refreshPromise = refreshPromise ?? refreshAccessToken();
        const tokens = await refreshPromise;
        refreshPromise = null;

        authStore.getState().setTokens(tokens);

        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${tokens.accessToken}`,
        };

        return apiClient.request(originalRequest);
      } catch (refreshError) {
        refreshPromise = null;
        forceLogoutAndRedirect();
        return Promise.reject(normalizeError(refreshError));
      }
    }

    return Promise.reject(normalizeError(error));
  }
);

export default apiClient;
