export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'kgjeyubnamdopqwvgh',
  expiresIn: '1d',
  refreshExpiresIn: '7d',
};