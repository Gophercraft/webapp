type LoginChallenge = {
  error_message?: string;
  captcha_id?: string;
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
};

type LogoutResponse = {
  error_message?: string;
};

export {
  LoginChallenge,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  RegistrationChallenge,
  RegistrationRequest,
  RegistrationResponse,
  CredentialStatus
};
