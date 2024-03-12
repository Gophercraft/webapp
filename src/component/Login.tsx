import * as React from 'react';
import { Navigate } from 'react-router-dom';

import api from '../api';

import '../style/card.css';
import '../style/captcha.css';
import '../style/input.css';

type LoginProps = {};

type LoginState = {
  account_name: string;
  password: string;
  captcha_id: string;
  captcha_solution: string;
  max_account_name_length: number;
  max_password_length: number;
  logged_in: boolean;
  has_login_challenge: boolean;
  login_error: string;
};

export default class Login extends React.Component<LoginProps, LoginState> {
  state: LoginState = {
    account_name: '',
    password: '',
    captcha_id: '',
    captcha_solution: '',
    max_account_name_length: 32,
    max_password_length: 128,
    logged_in: false,
    login_error: '',
    has_login_challenge: false
  };

  async begin_login_challenge() {
    try {
      const challenge = await api.Client.get_login_challenge();
      this.setState({
        has_login_challenge: true,
        captcha_id: challenge.captcha_id
      });
    } catch (err) {
      this.setState({
        login_error: `Cannot log in at this time, error contacting API: ${err}`
      });
    }
  }

  login_failed(err: any) {
    this.setState({
      password: '',
      login_error: err
    });

    this.begin_login_challenge();
  }

  on_account_name_update(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      account_name: event.target.value
    });
  }

  on_password_update(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      password: event.target.value
    });
  }

  on_captcha_solution_update(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      captcha_solution: event.target.value
    });
  }

  componentDidMount() {
    this.begin_login_challenge();
  }

  async on_login_button_click() {
    try {
      await api.Client.login({
        username: this.state.account_name,
        password: this.state.password,
        captcha_id: this.state.captcha_id,
        captcha_solution: this.state.captcha_solution
      });
      this.setState({
        logged_in: true
      });
    } catch (err) {
      this.login_failed(err);
    }
  }

  render() {
    const captcha_form = () => {
      if (this.state.captcha_id != '') {
        return (
          <>
            <img
              className="captcha"
              src={`/api/v1/captcha/${this.state.captcha_id}`}
            />
            <input
              className="text-input"
              type="text"
              id="register-captcha-solution"
              placeholder="Solve the captcha"
              value={this.state.captcha_solution}
              onChange={this.on_captcha_solution_update.bind(this)}
            ></input>
          </>
        );
      }
    };

    const login_error_message = () => {
      if (this.state.login_error != '') {
        return (
          <p className="form-error-message">{`${this.state.login_error}`}</p>
        );
      }
    };

    const nav_after_login = () => {
      if (this.state.logged_in) {
        return <Navigate to={'/account'} />;
      }
    };

    return (
      <div className="card">
        <div className="form-container">
          <input
            className="text-input"
            id="login-account-name"
            placeholder="Account name"
            maxLength={this.state.max_account_name_length}
            value={this.state.account_name}
            onChange={this.on_account_name_update.bind(this)}
          />
          <input
            className="text-input"
            type="password"
            id="login-account-password"
            placeholder="Password"
            maxLength={this.state.max_password_length}
            value={this.state.password}
            onChange={this.on_password_update.bind(this)}
          />
          {captcha_form()}
          <button
            id="login-account-button"
            className="form-button"
            onClick={this.on_login_button_click.bind(this)}
          >
            Log in
          </button>
          {login_error_message()}

          {nav_after_login()}
        </div>
      </div>
    );
  }
}
