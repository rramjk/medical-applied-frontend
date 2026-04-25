export type GenderType = 'MALE' | 'FEMALE';
export type RoleType = 'USER' | 'ADMIN';
export type EmailVerificationStatus =
  | 'FAILED'
  | 'UNVERIFIED'
  | 'CREATED'
  | 'PROCESSING'
  | 'SENT'
  | 'VERIFIED';

export interface ApiErrorResponse {
  status: number;
  error: string;
  message: string;
  timestamp: string;
}

export interface JwtAuthenticationResponse {
  accessToken: string;
}

export interface JwtPayload {
  sub: string;
  exp: number;
  iat: number;
  id: string;
  email: string;
  role: RoleType;
}

export interface MedicalDto {
  id: string;
  countryEn: string;
  countryRu: string;
  type: string;
  name: string;
  activeIngredient: string;
  description: string;
  indications: string;
  contraindications: string;
  dosing: string;
  kidneyFriendly: boolean | null;
  pregnantFriendly: boolean | null;
  breastfedFriendly: boolean | null;
  liverFriendly: boolean | null;
  childFriendly: boolean | null;
  stomachFriendly: boolean | null;
}

export interface UserDto {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: GenderType;
  roleId: string;
  roleName: RoleType;
  roleDescription: string;
  email: string;
  emailVerified: boolean;
  userConsent: boolean;
  privacyConsent: boolean;
  createdBy: string;
  createdDate: string;
  modifiedBy: string;
  modifiedDate: string;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface UserRequestDto {
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: GenderType;
  email: string;
  userConsent: boolean;
  privacyConsent: boolean;
}

export interface UserCreateRequestDto extends UserRequestDto {
  password: string;
}

export interface ResetPasswordRequestDto {
  oldPassword: string;
  newPassword: string;
}

export interface UserHealthProfileDto {
  id: string;
  userId: string;
  weight: number;
  chronicConditions: string[];
  healthFeatures: string[];
  allergies: string[];
  createdBy: string;
  createdDate: string;
  modifiedBy: string;
  modifiedDate: string;
}

export interface UserHealthProfileRequestDto {
  weight: number;
  chronicConditions: string[];
  healthFeatures: string[];
  allergies: string[];
}

export interface EmailVerificationDto {
  status: EmailVerificationStatus;
}

export interface AiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface AiConversation {
  id: string;
  countryEn: string;
  symptoms: string;
  messages: AiMessage[];
  createdAt: string;
  updatedAt: string;
}

export type AiAnswerRequestDto = {
  text: string;
};

export interface AuthIdentity {
  id: string;
  email: string;
  role: RoleType;
  exp: number;
}
