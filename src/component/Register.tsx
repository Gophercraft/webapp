// Libraries
import * as React from 'react';
import { Navigate } from 'react-router-dom';

import api from '../api';

// Style
import '../style/card.css';
import '../style/captcha.css';
import '../style/input.css';

type RegisterProps = {};

type RegisterState = {
  has_registration_challenge: boolean;
  email: string;
  account_name: string;
  password: string;
  captcha_id: string;
  captcha_solution: string;
  max_email_length: number;
  max_account_name_length: number;
  max_password_length: number;
  registration_error: string;
  registered: boolean;
};

export default class Register extends React.Component<
  RegisterProps,
  RegisterState
> {
  state: RegisterState = {
    has_registration_challenge: false,
    email: '',
    account_name: '',
    password: '',
    captcha_id: '',
    captcha_solution: '',
    max_email_length: 20,
    max_account_name_length: 16,
    max_password_length: 128,
    registration_error: '',
    registered: false
  };

  async begin_registration_challenge() {
    try {
      const challenge = await api.Client.get_registration_challenge();
      this.setState({
        has_registration_challenge: true,
        captcha_id: challenge.captcha_id,
        max_email_length: challenge.max_email_length,
        max_account_name_length: challenge.max_username_length,
        max_password_length: challenge.max_password_length
      });
    } catch (err) {
      this.setState({
        registration_error: `Cannot register at this time, error contacting API: ${err}`
      });
    }
  }

  componentDidMount() {
    this.begin_registration_challenge();
  }

  create_account() {
    const _this = this;
    api.Client.register({
      email: this.state.email,
      username: this.state.account_name,
      password: this.state.password,
      captcha_id: this.state.captcha_id,
      captcha_solution: this.state.captcha_solution
    })
      .then(() => {
        _this.setState({
          registered: true
        });
      })
      .catch((error_message) => {
        _this.setState({
          registration_error: error_message
        });
        _this.begin_registration_challenge();
      });
  }

  on_email_update(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      email: event.target.value
    });
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

  on_create_button_click() {
    if (!this.state.has_registration_challenge) {
      alert('Cannot register at this time.');
      return;
    }
    this.create_account();
  }

  validate_email(): string {
    if (this.state.email == '') {
      return '';
    }

    if (this.state.email.length > this.state.max_email_length) {
      return `email exceeds maximum length: ${this.state.max_email_length}`;
    }

    if (/^\S+@\S+\.\S+$/.test(this.state.account_name) == false) {
      return `not a valid email address`;
    }

    return '';
  }

  validate_account_name(): string {
    if (this.state.account_name == '') {
      return '';
    }

    if (this.state.account_name.length > this.state.max_account_name_length) {
      return `account name exceeds maximum length: ${this.state.max_account_name_length}`;
    }

    const match_account_name = /^[a-z0-9]+$/i;
    if (match_account_name.test(this.state.account_name) == false) {
      return `account name cannot have any whitespace or non-alphanumeric characters`;
    }

    return '';
  }

  validate_password(): string {
    if (this.state.password == '') {
      return '';
    }

    if (this.state.password.length > this.state.max_password_length) {
      return `password exceeds maximum length: ${this.state.max_password_length}`;
    }

    return '';
  }

  render() {
    const captcha_form = () => {
      if (this.state.captcha_id != '') {
        return (
          <>
            <img
              className='captcha'
              src={`/api/v1/captcha/${this.state.captcha_id}`}
            />
            <input
              className='text-input'
              type='text'
              id='register-captcha-solution'
              placeholder='Solve the captcha'
              value={this.state.captcha_solution}
              onChange={this.on_captcha_solution_update.bind(this)}
            ></input>
          </>
        );
      }
    };

    const registration_error_message = () => {
      if (this.state.registration_error != '') {
        return (
          <p className='form-error-message'>{`${this.state.registration_error}`}</p>
        );
      }
    };

    const email_validation = this.validate_email();
    const account_name_validation = this.validate_account_name();
    const password_validation = this.validate_password();

    const email_validation_message = () => {
      if (email_validation != '') {
        return <p className='form-error-message'>{email_validation}</p>;
      }
    };

    const account_name_validation_message = () => {
      if (account_name_validation != '') {
        return <p className='form-error-message'>{account_name_validation}</p>;
      }
    };

    const password_validation_message = () => {
      if (password_validation != '') {
        return <p className='form-error-message'>{password_validation}</p>;
      }
    };

    const nav_after_register = () => {
      if (this.state.registered) {
        return <Navigate to={'/login'} />;
      }
    };

    return (
      <div className='card'>
        <div className='form-container'>
          <input
            className='text-input'
            id='register-email'
            type='text'
            placeholder='Email address (optional)'
            maxLength={this.state.max_email_length}
            value={this.state.email}
            data-invalid-input={email_validation != ''}
            onChange={this.on_email_update.bind(this)}
          />
          {email_validation_message()}
          <input
            className='text-input'
            id='register-account-name'
            placeholder='Account name'
            maxLength={this.state.max_account_name_length}
            value={this.state.account_name}
            data-invalid-input={account_name_validation != ''}
            onChange={this.on_account_name_update.bind(this)}
          />
          {account_name_validation_message()}
          <input
            className='text-input'
            type='password'
            id='register-account-password'
            placeholder='Password'
            maxLength={this.state.max_password_length}
            value={this.state.password}
            data-invalid-input={password_validation != ''}
            onChange={this.on_password_update.bind(this)}
          />
          {password_validation_message()}
          {captcha_form()}
          <button
            id='register-account-button'
            className='form-button'
            onClick={this.on_create_button_click.bind(this)}
          >
            Create account
          </button>
          {registration_error_message()}

          {nav_after_register()}
        </div>
      </div>
    );
  }
}
