import jwt, { SignOptions } from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'mysecretkey';

interface IPayload {
  userId: string;
}

export const createToken = (
  payload: IPayload,
  expiresIn: SignOptions['expiresIn'],
) => {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn,
  });
};

export const verifyToken = (token: string) => {
  const tokenWithoutBearer = token.replace('Bearer ', '');
  return jwt.verify(tokenWithoutBearer, ACCESS_SECRET) as IPayload;
};
