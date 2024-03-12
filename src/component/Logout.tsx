import { useNavigate } from 'react-router-dom';
import api from '../api';
import * as React from 'react';

export default function Logout() {
  const navigate = useNavigate();

  const on_logout_click = () => {
    api.Client.logout()
      .then(() => {
        navigate('/');
      })
      .catch(() => {
        navigate('/');
      });
  };

  return (
    <div className="card">
      <div className="form-container">
        <button
          id="logout-account-button"
          className="form-button"
          onClick={on_logout_click}
        >
          Log out
        </button>
      </div>
    </div>
  );
}
