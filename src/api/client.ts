import {
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
} from './models';

enum ClientState {
  CLIENT_UNAUTHENTICATED = 0,
  CLIENT_AUTHENTICATED = 1
}

type ClientStateChangeHandler = (new_state: ClientState) => void;

class Client {
  static state: ClientState = ClientState.CLIENT_UNAUTHENTICATED;
  static web_access_point: string;
  static web_token: string;
  static state_change_handlers: ClientStateChangeHandler[] = [];
  static saved_version_info?: VersionInfo = null;

  static set_web_access_point(access_point: string) {
    Client.web_access_point = access_point;
  }

  static get_url(method: string): string {
    return `${this.web_access_point}/api/v1/${method}`;
  }

  static get_captcha_url(captcha_id: string): string {
    return Client.get_url(`captcha/${captcha_id}`);
  }

  static async request_json(
    method: string,
    url: string,
    body?: any
  ): Promise<any> {
    const request_init: RequestInit = {
      method: method,
      mode: 'cors',
      cache: 'no-cache'
    };
    const credential = Client.load_data('credential');
    if (credential) {
      request_init.headers = {
        'X-GC-Credential': credential.web_token
      };
    }

    if (body) {
      request_init.body = JSON.stringify(body);
    }

    const response = await fetch(url, request_init);
    if (
      response.headers.get('Content-Type') !== 'application/json; charset=utf-8'
    ) {
      return new Promise((_, reject) => reject(response.statusText));
    }

    return response.json();
  }

  // Web APIs

  static async get_service_addresses(): Promise<ServiceAddresses> {
    const endpoints_url = Client.get_url('service_addresses');
    return Client.request_json('GET', endpoints_url);
  }

  static async get_registration_challenge(): Promise<RegistrationChallenge> {
    const register_url = Client.get_url('register');
    return Client.request_json('GET', register_url);
  }

  static async post_registration_request(
    registration_request: RegistrationRequest
  ): Promise<LoginResponse> {
    const register_url = Client.get_url('register');
    return Client.request_json('POST', register_url, registration_request);
  }

  static async get_version_info(): Promise<VersionInfo> {
    const version_url = Client.get_url('version');
    return Client.request_json('GET', version_url);
  }

  static async get_login_challenge(): Promise<LoginChallenge> {
    const login_url = Client.get_url('login');
    return Client.request_json('GET', login_url);
  }

  static async post_login_request(
    login_request: LoginRequest
  ): Promise<LoginResponse> {
    const login_url = Client.get_url('login');
    return Client.request_json('POST', login_url, login_request);
  }

  static async get_credential_status(): Promise<CredentialStatus> {
    const credential_url = Client.get_url('credential');
    return Client.request_json('GET', credential_url);
  }

  static async get_logout_request(): Promise<LogoutResponse> {
    const credential_url = Client.get_url('logout');
    return Client.request_json('GET', credential_url);
  }

  static async get_account_status(): Promise<AccountStatus> {
    const account_url = Client.get_url('account');
    return Client.request_json('GET', account_url);
  }

  static async put_new_game_account(
    new_game_account_request: NewGameAccountRequest
  ): Promise<NewGameAccountResponse> {
    const new_game_account_url = Client.get_url('game_account');
    return Client.request_json(
      'PUT',
      new_game_account_url,
      new_game_account_request
    );
  }

  static async post_activate_game_account(id: string): Promise<ErrorResponse> {
    const activate_game_account_url = Client.get_url(
      `game_account/${id}/activate`
    );
    return Client.request_json('POST', activate_game_account_url);
  }

  static async post_rename_game_account(
    id: string,
    rename_game_account_request: RenameGameAccountRequest
  ): Promise<ErrorResponse> {
    const activate_game_account_url = Client.get_url(
      `game_account/${id}/rename`
    );
    return Client.request_json(
      'POST',
      activate_game_account_url,
      rename_game_account_request
    );
  }

  static async delete_delete_game_account(id: string): Promise<AccountStatus> {
    const delete_game_account_url = Client.get_url(`game_account/${id}`);
    return Client.request_json('DELETE', delete_game_account_url);
  }

  static async get_realm_status_list(): Promise<RealmStatusList> {
    const realm_status_url = Client.get_url('realm/status');
    return Client.request_json('GET', realm_status_url);
  }

  static async get_two_factor_authentication_methods(): Promise<TwoFactorAuthenticationMethods> {
    const two_factor_authentication_methods_url = Client.get_url('2fa/methods');
    return Client.request_json('GET', two_factor_authentication_methods_url);
  }

  static async post_authenticate_credential(
    credential_authentication_request: CredentialAuthenticationRequest
  ): Promise<CredentialAuthenticationResponse> {
    const authenticate_credential_url = Client.get_url('2fa/authenticate');
    return Client.request_json(
      'POST',
      authenticate_credential_url,
      credential_authentication_request
    );
  }

  static async post_enroll_2fa(
    enrollment_request: TwoFactorAuthenticationEnrollmentRequest
  ): Promise<TwoFactorAuthenticationEnrollmentResponse> {
    const enroll_2fa_url = Client.get_url('2fa/enroll');
    return Client.request_json('POST', enroll_2fa_url, enrollment_request);
  }

  // Utilities (long term storage)

  static save_data(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  static load_data(key: string): any {
    return JSON.parse(localStorage.getItem(key));
  }

  static remove_data(key: string) {
    localStorage.removeItem(key);
  }

  static on_state_change(change_handler: ClientStateChangeHandler) {
    Client.state_change_handlers.push(change_handler);
  }

  static set_state(state: ClientState) {
    Client.state = state;
    for (let handler of Client.state_change_handlers) {
      handler(state);
    }
  }

  static remove_credential() {
    Client.remove_data('credential');
  }

  static async version_info(): Promise<VersionInfo> {
    if (Client.saved_version_info !== null) {
      return new Promise((resolve) => resolve(Client.saved_version_info));
    }
    try {
      const response = await Client.get_version_info();
      if (typeof response.error_message == 'string') {
        return new Promise((_, reject) => reject(response.error_message));
      }
      Client.saved_version_info = response;
      return new Promise((resolve) => resolve(response));
    } catch (err) {
      return new Promise((_, reject) => reject(err));
    }
  }

  static async check_credential(): Promise<CredentialStatus> {
    if (!this.load_data('credential')) {
      // Resolve if no credential is logged in
      return new Promise((resolve) => resolve({}));
    }

    // Ask the server if our credential is valid
    try {
      // If the server sends an error message with the response,
      // it means an unrelated error occurred
      const credential_status = await Client.get_credential_status();
      if (typeof credential_status.error_message == 'string') {
        return new Promise((_, reject) =>
          reject(credential_status.error_message)
        );
      }

      // if the credential status is true
      if (credential_status.web_token_status == 'AUTHENTICATED') {
        // Propagate to listeners that the client is authenticated
        Client.set_state(ClientState.CLIENT_AUTHENTICATED);
      } else {
        // if the credential status is logged out
        // remove the credential
        if (credential_status.web_token_status == 'LOGGED_OUT') {
          Client.remove_credential();
        }
        // propagate logged out status to listeners
        Client.set_state(ClientState.CLIENT_UNAUTHENTICATED);
      }

      return new Promise((resolve) => resolve(credential_status));
    } catch (err) {
      return new Promise((_, reject) => reject(err));
    }
  }

  static async registration_challenge(): Promise<RegistrationChallenge> {
    try {
      const response = await Client.get_registration_challenge();
      if (typeof response.error_message == 'string') {
        return new Promise((_, reject) => reject(response.error_message));
      }
      return new Promise((resolve) => resolve(response));
    } catch (err) {
      return new Promise((_, reject) => reject(err));
    }
  }

  static async register(
    registration_request: RegistrationRequest
  ): Promise<RegistrationResponse> {
    try {
      // Submit POST request to register API
      const response =
        await Client.post_registration_request(registration_request);
      // Registration failed if error message is present
      if (typeof response.error_message == 'string') {
        return new Promise((_, reject) => reject(response.error_message));
      }
      // Resolve
      return new Promise((resolve) => resolve(response));
    } catch (err) {
      return new Promise((_, reject) => reject(err));
    }
  }

  static async login(login_request: LoginRequest): Promise<LoginResponse> {
    try {
      // submit POST request to login API
      const response = await Client.post_login_request(login_request);
      // Login failed if error message is present
      if (typeof response.error_message == 'string') {
        return new Promise((_, reject) => reject(response.error_message));
      }
      // Save credential to localStorage
      Client.save_data('credential', {
        username: login_request.username,
        web_token: response.web_token
      });

      // Success
      return new Promise((resolve) => resolve(response));
    } catch (err) {
      return new Promise((_, reject) => reject(err));
    }
  }

  static async logout(): Promise<LogoutResponse> {
    try {
      const response = await Client.get_logout_request();
      if (typeof response.error_message == 'string') {
        return new Promise((_, reject) => reject(response.error_message));
      }
      Client.remove_credential();
      Client.set_state(ClientState.CLIENT_UNAUTHENTICATED);
      return new Promise((resolve) => resolve(response));
    } catch (err) {
      return new Promise((_, reject) => reject(err));
    }
  }

  static async check_account(): Promise<AccountStatus> {
    try {
      const response = await Client.get_account_status();
      if (typeof response.error_message == 'string') {
        return new Promise((_, reject) => reject(response.error_message));
      }
      return new Promise((resolve) => resolve(response));
    } catch (err) {
      return new Promise((_, reject) => reject(err));
    }
  }

  static async new_game_account(
    new_game_account_request: NewGameAccountRequest
  ): Promise<NewGameAccountResponse> {
    try {
      const response = await Client.put_new_game_account(
        new_game_account_request
      );
      if (typeof response.error_message == 'string') {
        return new Promise((_, reject) => reject(response.error_message));
      }
      return new Promise((resolve) => resolve(response));
    } catch (err) {
      return new Promise((_, reject) => reject(err));
    }
  }

  static async activate_game_account(id: string): Promise<ErrorResponse> {
    try {
      const response = await Client.post_activate_game_account(id);
      if (typeof response.error_message == 'string') {
        return new Promise((_, reject) => reject(response.error_message));
      }
      return new Promise((resolve) => resolve(response));
    } catch (err) {
      return new Promise((_, reject) => reject(err));
    }
  }

  static async delete_game_account(id: string): Promise<ErrorResponse> {
    try {
      const response = await Client.delete_delete_game_account(id);
      if (typeof response.error_message == 'string') {
        return new Promise((_, reject) => reject(response.error_message));
      }
      return new Promise((resolve) => resolve(response));
    } catch (err) {
      return new Promise((_, reject) => reject(err));
    }
  }

  static async rename_game_account(
    id: string,
    rename_game_account: RenameGameAccountRequest
  ): Promise<ErrorResponse> {
    try {
      const response = await Client.post_rename_game_account(
        id,
        rename_game_account
      );
      if (typeof response.error_message == 'string') {
        return new Promise((_, reject) => reject(response.error_message));
      }
      return new Promise((resolve) => resolve(response));
    } catch (err) {
      return new Promise((_, reject) => reject(err));
    }
  }

  static async realm_status_list(): Promise<RealmStatusList> {
    try {
      const response = await Client.get_realm_status_list();
      if (typeof response.error_message == 'string') {
        return new Promise((_, reject) => reject(response.error_message));
      }
      return new Promise((resolve) => resolve(response));
    } catch (err) {
      return new Promise((_, reject) => reject(err));
    }
  }

  static async service_addresses(): Promise<ServiceAddresses> {
    try {
      const response = await Client.get_service_addresses();
      if (typeof response.error_message == 'string') {
        return new Promise((_, reject) => reject(response.error_message));
      }
      return new Promise((resolve) => resolve(response));
    } catch (err) {
      return new Promise((_, reject) => reject(err));
    }
  }

  static async two_factor_authentication_methods(): Promise<TwoFactorAuthenticationMethods> {
    try {
      const response = await Client.get_two_factor_authentication_methods();
      if (typeof response.error_message == 'string') {
        return new Promise((_, reject) => reject(response.error_message));
      }
      return new Promise((resolve) => resolve(response));
    } catch (err) {
      return new Promise((_, reject) => reject(err));
    }
  }

  static async authenticate_credential(
    credential_authentication_request: CredentialAuthenticationRequest
  ): Promise<CredentialAuthenticationResponse> {
    try {
      const response = await Client.post_authenticate_credential(
        credential_authentication_request
      );
      if (typeof response.error_message == 'string') {
        return new Promise((_, reject) => reject(response.error_message));
      }
      return new Promise((resolve) => resolve(response));
    } catch (err) {
      return new Promise((_, reject) => reject(err));
    }
  }

  static async enroll_2fa(
    enrollment_request: TwoFactorAuthenticationEnrollmentRequest
  ): Promise<TwoFactorAuthenticationEnrollmentResponse> {
    try {
      const response = await Client.post_enroll_2fa(enrollment_request);
      if (typeof response.error_message == 'string') {
        return new Promise((_, reject) => reject(response.error_message));
      }
      return new Promise((resolve) => resolve(response));
    } catch (err) {
      return new Promise((_, reject) => reject(err));
    }
  }
}

export { Client, ClientState };
