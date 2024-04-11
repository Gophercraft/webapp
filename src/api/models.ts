type VersionInfo = {
  error_message?: string;
  core_version?: string;
  brand?: string;
  project_url?: string;
};

type LoginChallenge = {
  error_message?: string;
  captcha_id?: string;
};

type ErrorResponse = {
  error_message?: string;
};

type LoginRequest = {
  username: string;
  password: string;
  captcha_id?: string;
  captcha_solution?: string;
};

type LoginResponse = {
  error_message?: string;
  web_token?: string;
};

type RegistrationChallenge = {
  email_required?: boolean;
  max_email_length?: number;
  max_username_length?: number;
  max_password_length?: number;
  error_message?: string;
  captcha_id?: string;
};

type RegistrationRequest = {
  email: string;
  username: string;
  password: string;
  captcha_id?: string;
  captcha_solution?: string;
};

type RegistrationResponse = {
  error_message?: string;
  web_token?: string;
};

type CredentialStatus = {
  error_message?: string;
  credential_is_valid?: boolean;
  web_token_status?: string;
};

type LogoutResponse = {
  error_message?: string;
};

type GameAccountStatus = {
  name: string;
  id: string;
  characters: number;
  active: boolean;
  banned: boolean;
  suspended: boolean;
  suspension_lift_date?: string;
};

type AccountStatus = {
  error_message?: string;
  username?: string;
  account_id?: string;
  account_tier?: string;
  email?: string;
  creation_date?: string;
  email_verified?: boolean;
  preferred_two_factor_authentication_method?: string;
  authenticator?: boolean;
  locked?: boolean;
  suspended?: boolean;
  suspension_lift_date?: string;
  game_accounts?: GameAccountStatus[];
};

type NewGameAccountRequest = {
  name: string;
};

type NewGameAccountResponse = {
  error_message?: string;
  id?: string;
};

type RenameGameAccountRequest = {
  name: string;
};

type RealmStatus = {
  id?: string;
  name?: string;
  description?: string;
  build?: string;
  expansion?: number;
  online?: boolean;
};

type RealmStatusList = {
  error_message?: string;
  realms?: RealmStatus[];
};

interface AddressMap {
  [key: string]: string;
}

type ServiceAddresses = {
  error_message?: string;
  addresses?: AddressMap;
};

type CredentialAuthenticationRequest = {
  error_message?: string;
  two_factor_authentication_method?: string;
  authenticator_password?: string;
};

type CredentialAuthenticationResponse = {
  error_message?: string;
  authenticated?: boolean;
};

type TwoFactorAuthenticationEnrollmentRequest = {
  error_message?: string;
  totp_secret?: string;
  totp_password?: string;
};

type TwoFactorAuthenticationEnrollmentResponse = {
  error_message?: string;
  enrolled?: string;
};

type TwoFactorAuthenticationMethods = {
  error_message?: string;
  methods?: string[];
};

export {
  VersionInfo,
  ErrorResponse,
  LoginChallenge,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  RegistrationChallenge,
  RegistrationRequest,
  RegistrationResponse,
  CredentialStatus,
  AccountStatus,
  GameAccountStatus,
  NewGameAccountRequest,
  NewGameAccountResponse,
  RenameGameAccountRequest,
  RealmStatusList,
  ServiceAddresses,
  CredentialAuthenticationRequest,
  CredentialAuthenticationResponse,
  TwoFactorAuthenticationEnrollmentRequest,
  TwoFactorAuthenticationEnrollmentResponse,
  TwoFactorAuthenticationMethods
};
