export interface UpdateJudgeProfileDTO {
  name?: string;
  password?: string;
}

export function validateUpdateJudge(body: any): string | null {
  if (body.name !== undefined && (typeof body.name !== 'string' || body.name.trim().length === 0)) {
    return 'Name cannot be empty';
  }
  if (body.password !== undefined && (typeof body.password !== 'string' || body.password.length < 6)) {
    return 'Password must be at least 6 characters long';
  }
  return null;
}
