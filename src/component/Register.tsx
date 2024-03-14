// Libraries
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../api';

// Style
import '../style/card.css';
import '../style/captcha.css';
import '../style/input.css';

export default function Register() {
  const navigate = useNavigate();

  // State

  const [email, set_email] = useState('');
  const [account_name, set_account_name] = useState('');
  const [password, set_password] = useState('');
  const [captcha_id, set_captcha_id] = useState('');
  const [captcha_solution, set_captcha_solution] = useState('');
  const [registration_error, set_registration_error] = useState('');
  const [max_email_length, set_max_email_length] = useState(32);
  const [max_account_name_length, set_max_account_name_length] = useState(32);
  const [max_password_length, set_max_password_length] = useState(128);
  const [has_registration_challenge, set_has_registration_challenge] =
    useState(false);

  const begin_registration_challenge = async () => {
    try {
      const challenge = await api.Client.get_registration_challenge();
      set_has_registration_challenge(true);
      set_captcha_id(challenge.captcha_id);
      set_max_email_length(challenge.max_email_length);
      set_max_account_name_length(challenge.max_username_length);
      set_max_password_length(challenge.max_password_length);
    } catch (err) {
      this.setState({
        registration_error: `Cannot register at this time, error contacting API: ${err}`
      });
    }
  };

  useEffect(() => {
    begin_registration_challenge();
  }, []);

  // Handlers

  const create_account = async () => {
    try {
      const response = await api.Client.register({
        email: email,
        username: account_name,
        password: password,
        captcha_id: captcha_id,
        captcha_solution: captcha_solution
      });
      // TODO: alert use to the necessity of confirming email address
      // if response says so
      navigate('/login');
    } catch (err) {
      set_registration_error(err);
      begin_registration_challenge();
    }
  };

  const on_email_update = (event: React.ChangeEvent<HTMLInputElement>) => {
    set_email(event.target.value);
  };

  const on_account_name_update = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    set_account_name(event.target.value);
  };

  const on_password_update = (event: React.ChangeEvent<HTMLInputElement>) => {
    set_password(event.target.value);
  };

  const on_captcha_solution_update = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    set_captcha_solution(event.target.value);
  };

  const on_create_button_click = () => {
    if (!has_registration_challenge) {
      alert('Cannot register at this time.');
      return;
    }
    create_account();
  };

  const validate_email = (): string => {
    if (email == '') {
      return '';
    }

    if (email.length > max_email_length) {
      return `email exceeds maximum length: ${max_email_length}`;
    }

    if (/^\S+@\S+\.\S+$/.test(account_name) == false) {
      return `not a valid email address`;
    }

    return '';
  };

  const validate_account_name = (): string => {
    if (account_name == '') {
      return '';
    }

    if (account_name.length > max_account_name_length) {
      return `account name exceeds maximum length: ${max_account_name_length}`;
    }

    const match_account_name = /^[a-z0-9]+$/i;
    if (match_account_name.test(account_name) == false) {
      return `account name cannot have any whitespace or non-alphanumeric characters`;
    }

    return '';
  };

  const validate_password = (): string => {
    if (password == '') {
      return '';
    }

    if (password.length > max_password_length) {
      return `password exceeds maximum length: ${max_password_length}`;
    }

    return '';
  };

  // render

  const captcha_form = () => {
    if (captcha_id != '') {
      return (
        <>
          <img
            className='captcha'
            src={api.Client.get_captcha_url(captcha_id)}
          />
          <input
            className='text-input'
            type='text'
            id='register-captcha-solution'
            placeholder='Solve the captcha'
            value={captcha_solution}
            onChange={on_captcha_solution_update}
          ></input>
        </>
      );
    }
  };

  const registration_error_message = () => {
    if (registration_error != '') {
      return <p className='form-error-message'>{registration_error}</p>;
    }
  };

  const email_validation = validate_email();
  const account_name_validation = validate_account_name();
  const password_validation = validate_password();

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

  return (
    <div className='card'>
      <div className='form-container'>
        <input
          className='text-input'
          id='register-email'
          type='text'
          placeholder='Email address (optional)'
          maxLength={max_email_length}
          value={email}
          data-invalid-input={email_validation != ''}
          onChange={on_email_update}
        />
        {email_validation_message()}
        <input
          className='text-input'
          id='register-account-name'
          placeholder='Account name'
          maxLength={max_account_name_length}
          value={account_name}
          data-invalid-input={account_name_validation != ''}
          onChange={on_account_name_update}
        />
        {account_name_validation_message()}
        <input
          className='text-input'
          type='password'
          id='register-account-password'
          placeholder='Password'
          maxLength={max_password_length}
          value={password}
          data-invalid-input={password_validation != ''}
          onChange={on_password_update}
        />
        {password_validation_message()}
        {captcha_form()}
        <button
          id='register-account-button'
          className='form-button'
          onClick={on_create_button_click}
        >
          Create account
        </button>
        {registration_error_message()}
      </div>
    </div>
  );
}
