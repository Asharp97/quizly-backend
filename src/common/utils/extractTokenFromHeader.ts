export default function extractTokenFromHeader(
  request: Request,
): string | undefined {
  const authHeader = request.headers['authorization'];
  if (!authHeader) return undefined;

  const [type, token] = authHeader.split(' ');
  return type === 'Bearer' ? token : undefined;
}
