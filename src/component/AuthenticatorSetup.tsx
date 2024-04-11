import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Base32 } from '@niyari/base32-ts';
import QRCode from 'qrcode';

import api from '../api';

import '../style/card.css';
import '../style/captcha.css';
import '../style/input.css';
import '../style/authenticator.css';

const generate_totp_secret = (): string => {
  const base32 = new Base32({ variant: '4648' });
  let totp_secret_bytes = window.crypto.getRandomValues(new Uint8Array(24));
  let secret = base32.encode(totp_secret_bytes);
  return secret as string;
};

const totp_uri_create = (
  issuer_name: string,
  username: string,
  secret: string
): string => {
  const issuer_name_escaped = encodeURIComponent(issuer_name);
  const username_escaped = encodeURIComponent(username);
  const secret_escaped = encodeURIComponent(secret);

  return `otpauth://totp/${issuer_name_escaped}:${username_escaped}?secret=${secret_escaped}&issuer=${issuer_name_escaped}&algorithm=SHA1&digits=6&period=30`;
};

const totp_barcode_create = async (totp_uri: string): Promise<string> => {
  return QRCode.toDataURL(totp_uri);
};

export default function AuthenticatorSetup() {
  const navigate = useNavigate();
  // State

  const [totp_barcode_image, set_totp_barcode_image] = useState<string>('');
  const [totp_secret, set_totp_secret] = useState<string>('');
  const [passcode, set_passcode] = useState<string>('');
  const [passcode_valid, set_passcode_valid] = useState<boolean>(true);

  const regenerate_secret = async (issuer_name: string, username: string) => {
    let secret = generate_totp_secret();
    set_totp_secret(secret);

    try {
      const barcode = await totp_barcode_create(
        totp_uri_create(issuer_name, username, secret)
      );
      set_totp_barcode_image(barcode);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const saved_credential = api.Client.load_data('credential');
    const saved_username: string = saved_credential.username;

    api.Client.version_info().then((version_info) => {
      regenerate_secret(version_info.brand, saved_username);
    });
  }, []);

  const check_passcode = (passcode_value: string) => {
    if (passcode_value.length == 6) {
      api.Client.enroll_2fa({
        totp_secret: totp_secret,
        totp_password: passcode_value
      }).then((response) => {
        if (response.enrolled) {
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

  const on_barcode_click = () => {
    navigator.clipboard.writeText(totp_secret)
    .then(() => {
      alert("Copied secret!");
    })
  }

  return (
    <div className='card'>
      <div className='form-container'>
        <h1 className='authenticator-title'>Set Up Authenticator</h1>

        <p className='authenticator-help-text'>
          Scan the barcode into your authenticator app, or click the barcode to copy the TOTP secret code into your clipboard
        </p>

        {(() => {
          if (totp_barcode_image !== '') {
            return (
              <a
                className='authenticator-setup-barcode-link'
                onClick={on_barcode_click}>
                  <img
                  className='authenticator-setup-barcode-image'
                  src={totp_barcode_image}
                ></img>
              </a>
            );
          }
        })()}

        <p className='authenticator-help-text'>
          Enter the generated code to confirm that you've set up your authenticator app:
        </p>

        <input
          className='text-input'
          type='text'
          id='authenticator-setup-passcode'
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
