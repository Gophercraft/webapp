import {
  LoginChallenge,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  RegistrationChallenge,
  RegistrationRequest,
  RegistrationResponse,
  CredentialStatus
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

  static set_web_access_point(access_point: string) {
    Client.web_access_point = access_point;
  }

  static get_url(method: string): string {
    return `${this.web_access_point}/api/v1/${method}`;
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
    if (response.status != 200) {
      return new Promise((_, reject) => reject(response.statusText));
    }

    return response.json();
  }

  // Web APIs

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

  static async check_credential(): Promise<CredentialStatus> {
    if (!this.load_data('credential')) {
      return new Promise((resolve) => resolve({}));
    }

    try {
      const credential_status = await Client.get_credential_status();
      if (typeof credential_status.error_message == 'string') {
        return new Promise((_, reject) =>
          reject(credential_status.error_message)
        );
      }

      if (credential_status.credential_is_valid) {
        Client.set_state(ClientState.CLIENT_AUTHENTICATED);
      } else {
        Client.remove_credential();
        Client.set_state(ClientState.CLIENT_UNAUTHENTICATED);
      }
    } catch (err) {
      return new Promise((_, reject) => reject(err));
    }
  }

  static async register(
    registration_request: RegistrationRequest
  ): Promise<RegistrationResponse> {
    try {
      const response =
        await Client.post_registration_request(registration_request);
      if (typeof response.error_message == 'string') {
        return new Promise((_, reject) => reject(response.error_message));
      }
      return new Promise((resolve) => resolve(response));
    } catch (err) {
      return new Promise((_, reject) => reject(err));
    }
  }

  static async login(login_request: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await Client.post_login_request(login_request);
      if (typeof response.error_message == 'string') {
        return new Promise((_, reject) => reject(response.error_message));
      }
      Client.save_data('credential', {
        username: login_request.username,
        web_token: response.web_token
      });
      Client.set_state(ClientState.CLIENT_AUTHENTICATED);

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
}

export { Client, ClientState };
