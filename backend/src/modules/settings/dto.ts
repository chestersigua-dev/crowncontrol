export interface CreateSectionDTO {
  name: string;
  weight: number;
  description?: string;
  isActive?: boolean;
}

export interface CreateCriteriaDTO {
  name: string;
  maxPoints: number;
  weight: number;
  pageantSectionId: string;
}

export function validateSection(body: any): string | null {
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
    return 'Section name is required';
  }
  if (body.weight === undefined || typeof body.weight !== 'number' || body.weight < 0 || body.weight > 1) {
    return 'Section weight must be a number between 0 and 1';
  }
  return null;
}

export function validateCriteria(body: any): string | null {
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
    return 'Criteria name is required';
  }
  if (body.maxPoints === undefined || typeof body.maxPoints !== 'number' || body.maxPoints <= 0) {
    return 'maxPoints must be a positive number';
  }
  if (body.weight === undefined || typeof body.weight !== 'number' || body.weight < 0 || body.weight > 1) {
    return 'Criteria weight must be a number between 0 and 1';
  }
  if (!body.pageantSectionId || typeof body.pageantSectionId !== 'string') {
    return 'pageantSectionId is required';
  }
  return null;
}
