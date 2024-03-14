import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../api';

import '../style/card.css';
import '../style/captcha.css';
import '../style/input.css';

export default function Login() {
  const navigate = useNavigate();

  // State

  const [account_name, set_account_name] = useState('');
  const [password, set_password] = useState('');
  const [captcha_id, set_captcha_id] = useState('');
  const [captcha_solution, set_captcha_solution] = useState('');
  const [login_error, set_login_error] = useState('');
  const [max_account_name_length] = useState(32);
  const [max_password_length] = useState(128);
  const [has_login_challenge, set_has_login_challenge] = useState(false);

  const begin_login_challenge = async () => {
    try {
      const challenge = await api.Client.get_login_challenge();

      set_has_login_challenge(true);
      set_captcha_id(challenge.captcha_id);
    } catch (err) {
      set_login_error(
        `Cannot log in at this time, error contacting API: ${err}`
      );
    }
  };

  useEffect(() => {
    begin_login_challenge();
  }, []);

  // Handlers

  const login_failed = (err: string) => {
    set_password('');
    set_captcha_solution('');
    set_login_error(err);
    begin_login_challenge();
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

  const on_login_button_click = async () => {
    if (!has_login_challenge) {
      alert('Cannot log in at this time. Please try again later.');
      return;
    }
    try {
      await api.Client.login({
        username: account_name,
        password: password,
        captcha_id: captcha_id,
        captcha_solution: captcha_solution
      });
      navigate('/account');
    } catch (err) {
      login_failed(err);
    }
  };

  // Render
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

  const login_error_message = () => {
    if (login_error != '') {
      return <p className='form-error-message'>{login_error}</p>;
    }
  };

  return (
    <div className='card'>
      <div className='form-container'>
        <input
          className='text-input'
          id='login-account-name'
          placeholder='Account name'
          maxLength={max_account_name_length}
          value={account_name}
          onChange={on_account_name_update}
        />
        <input
          className='text-input'
          type='password'
          id='login-account-password'
          placeholder='Password'
          maxLength={max_password_length}
          value={password}
          onChange={on_password_update}
        />
        {captcha_form()}
        <button
          id='login-account-button'
          className='form-button'
          onClick={on_login_button_click}
        >
          Log in
        </button>
        {login_error_message()}
      </div>
    </div>
  );
}
