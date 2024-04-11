import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../api';

import '../style/card.css';
import '../style/captcha.css';
import '../style/input.css';
import '../style/authenticator.css';

interface DisplayStrings {
  [key: string]: string;
}

const method_names: DisplayStrings = {
  EMAIL: 'Email',
  TOTP: 'TOTP Authenticator'
};

const method_question_text: DisplayStrings = {
  EMAIL: 'Enter the passcode that we sent to your e-mail inbox',
  TOTP: 'Enter the generated six-digit passcode'
};

export default function Authenticate() {
  const navigate = useNavigate();
  // State
  const [two_factor_methods, set_two_factor_methods] = useState<string[]>([]);
  const [two_factor_method, set_two_factor_method] = useState<string>('');
  const [passcode, set_passcode] = useState<string>('');
  const [passcode_valid, set_passcode_valid] = useState<boolean>(true);

  useEffect(() => {
    api.Client.two_factor_authentication_methods()
      .then((list) => {
        set_two_factor_methods(list.methods);
        if (list.methods && list.methods.length > 0) {
          set_two_factor_method(list.methods[0]);
        }
      })
      .catch(() => {});
  }, []);

  const render_two_factor_method_option = (method: string) => {
    const method_name = method_names[method] ? method_names[method] : '';
    if (method_name == '') {
      return;
    }

    return <option value={method}>{method_name}</option>;
  };

  const on_two_factor_methods_change = () => {};

  const render_two_factor_methods_list = () => {
    return (
      <select value={two_factor_method} onChange={on_two_factor_methods_change}>
        {two_factor_methods.map((method) => {
          return render_two_factor_method_option(method);
        })}
      </select>
    );
  };

  const request_email_send = async () => {};

  const render_email_send_button = () => {
    return (
      <a
        className='authenticate-email-send-button'
        onClick={request_email_send}
      >
        Not seeing that passcode e-email? Click here to send a new code
      </a>
    );
  };

  const render_passcode_question = () => {
    if (two_factor_method == '') {
      return;
    }
    const question_text = method_question_text[two_factor_method]
      ? method_question_text[two_factor_method]
      : '';
    if (question_text == '') {
      return;
    }

    return (
      <div className='authenticate-passcode-question'>
        <p className='authenticate-passcode-question-text'></p>

        {(() => {
          if (two_factor_method == 'EMAIL') {
            return render_email_send_button();
          }
        })()}
      </div>
    );
  };

  const check_passcode = (passcode_value: string) => {
    if (passcode_value.length == 6) {
      api.Client.authenticate_credential({
        authenticator_password: passcode_value,
        two_factor_authentication_method: two_factor_method
      }).then((response) => {
        if (response.authenticated) {
          navigate('/account');
        } else {
          set_passcode_valid(false);
        }
      });
    } else {
      set_passcode_valid(true);
    }
  };

  const on_passcode_update = (event: React.ChangeEvent<HTMLInputElement>) => {
    set_passcode(event.target.value);
    if (event.target.value !== passcode) {
      check_passcode(event.target.value);
    }
  };

  return (
    <div className='card'>
      <div className='form-container'>
        <h1 className='authenticator-title'>Authenticate</h1>

        {render_two_factor_methods_list()}
        {render_passcode_question()}

        <input
          className='text-input'
          type='text'
          id='authenticate-passcode'
          placeholder='Passcode'
          maxLength={6}
          value={passcode}
          onChange={on_passcode_update}
          data-invalid-input={!passcode_valid}
        />
      </div>
    </div>
  );
}
