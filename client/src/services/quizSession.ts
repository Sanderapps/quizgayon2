const QUIZ_TOKEN_KEY = "quiz_token";

export function getQuizToken(): string | null {
  try {
    return sessionStorage.getItem(QUIZ_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setQuizToken(token: string): void {
  try {
    sessionStorage.setItem(QUIZ_TOKEN_KEY, token);
  } catch {
    // noop
  }
}

export function clearQuizToken(): void {
  try {
    sessionStorage.removeItem(QUIZ_TOKEN_KEY);
  } catch {
    // noop
  }
}