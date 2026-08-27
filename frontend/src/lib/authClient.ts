import { AuthExpiredError } from "@/lib/errors";

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

let currentTokens: Tokens | null = null;
let refreshMutex: Promise<boolean> | null = null;

export function getAccessToken(): string | null {
  return currentTokens?.accessToken ?? null;
}

export function setTokens(tokens: Tokens): void {
  currentTokens = tokens;
}

export function clearTokens(): void {
  currentTokens = null;
}

function loadRefreshToken(): string | null {
  try {
    const raw = localStorage.getItem("lunara.session.v1");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { refreshToken?: string } };
    return parsed?.state?.refreshToken ?? null;
  } catch {
    return null;
  }
}

async function doRefresh(): Promise<boolean> {
  const refreshToken = loadRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!response.ok) return false;
    const body = (await response.json()) as { access_token: string; refresh_token: string };
    setTokens({ accessToken: body.access_token, refreshToken: body.refresh_token });
    return true;
  } catch {
    return false;
  }
}

export async function refreshAccessToken(): Promise<boolean> {
  if (refreshMutex) return refreshMutex;
  refreshMutex = doRefresh().finally(() => {
    refreshMutex = null;
  });
  return refreshMutex;
}

export async function authAwareFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = getAccessToken();
  const headers = new Headers(init?.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(path, { ...init, headers });

  if (response.status === 401 && token) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) throw new AuthExpiredError();
    const retryToken = getAccessToken();
    const retryHeaders = new Headers(init?.headers);
    if (retryToken) retryHeaders.set("Authorization", `Bearer ${retryToken}`);
    return fetch(path, { ...init, headers: retryHeaders });
  }

  return response;
}
