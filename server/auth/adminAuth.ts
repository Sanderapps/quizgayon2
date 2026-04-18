import type { NextFunction, Request, Response } from "express";

function readAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD?.trim();

  if (!password) {
    throw new Error("ADMIN_PASSWORD environment variable is required");
  }

  return password;
}

export function requireAdminPassword(req: Request, res: Response, next: NextFunction) {
  let adminPassword: string;

  try {
    adminPassword = readAdminPassword();
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Admin authentication is not configured",
    });
  }

  const providedPassword = req.headers["x-admin-password"];

  if (typeof providedPassword !== "string" || providedPassword !== adminPassword) {
    return res.status(401).json({
      error: "Senha de administrador incorreta",
    });
  }

  next();
}

export function isValidAdminPassword(password: string): boolean {
  return password === readAdminPassword();
}

export function assertAdminPasswordConfigured() {
  readAdminPassword();
}
