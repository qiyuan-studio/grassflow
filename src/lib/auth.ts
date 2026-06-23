import jwt, { type SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createUser, getUserByEmail, getUserById, getSubscription, createLicenseKey } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "grassflow-jwt-secret-2026";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export interface JwtPayload {
  userId: number;
  email: string;
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function generateToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as any,
  };
  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export async function registerUser(email: string, password: string) {
  const existing = getUserByEmail(email);
  if (existing) {
    throw new Error("该邮箱已注册");
  }

  const hashedPwd = hashPassword(password);
  const userId = createUser(email, hashedPwd);
  const token = generateToken({ userId: Number(userId), email });
  return { userId, email, token };
}

export async function loginUser(email: string, password: string) {
  const user = getUserByEmail(email) as any;
  if (!user) {
    throw new Error("邮箱或密码错误");
  }

  if (!verifyPassword(password, user.password)) {
    throw new Error("邮箱或密码错误");
  }

  const token = generateToken({ userId: user.id, email: user.email });
  return { userId: user.id, email: user.email, token };
}

export function getUserFromToken(token: string) {
  const payload = verifyToken(token);
  if (!payload) return null;
  const user = getUserById(payload.userId) as any;
  if (!user) return null;
  const subscription = getSubscription(payload.userId) as any;
  return {
    id: user.id,
    email: user.email,
    nickname: user.nickname,
    subscription: subscription
      ? {
          plan: subscription.plan,
          licenseKey: subscription.license_key,
          expiresAt: subscription.expires_at,
          maxGenerations: subscription.max_generations,
        }
      : { plan: "free", maxGenerations: 3 },
  };
}

export function purchaseLicense(userId: number, plan: "monthly" | "permanent") {
  return createLicenseKey(userId, plan);
}
