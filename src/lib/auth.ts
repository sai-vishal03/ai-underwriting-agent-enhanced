import { jwtVerify, SignJWT } from 'jose';

// Fetch from env, but default fallback for development purposes
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-grabon-vibe-coder-key';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

export interface JWTPayloadData {
  id: string;
  email: string;
  name: string;
  role: 'Admin' | 'Analyst' | 'Viewer';
  [key: string]: any;
}

/**
 * Creates a signed JWT using jose (Edge compatible)
 */
export async function signToken(payload: JWTPayloadData, expirationTime: string = '15m'): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(encodedSecret);

  return token;
}

/**
 * Verifies and decodes a JWT using jose (Edge compatible)
 */
export async function verifyToken(token: string): Promise<JWTPayloadData | null> {
  try {
    const { payload } = await jwtVerify(token, encodedSecret);
    return payload as unknown as JWTPayloadData;
  } catch (error) {
    return null;
  }
}
