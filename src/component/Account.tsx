// Libraries

import React, { useState, useEffect } from 'react';

import api from '../api';

import { AccountStatus, GameAccountStatus } from '../api/models';

// Styles

import '../style/card.css';
import '../style/fonts.css';
import '../style/account.css';
import '../style/input.css';
import { useNavigate } from 'react-router-dom';

type AccountProperty = {
  name: string;
  key: string;
  value: string;
  name_class?: string;
  value_class?: string;
};

interface HumanConversion {
  [key: string]: string;
}

export default function Account() {
  const navigate = useNavigate();

  const [account_title, set_account_title] = useState('');
  const [account_status, set_account_status] = useState<AccountStatus>({});
  const [account_status_error, set_account_status_error] = useState('');

  const get_account_status = async () => {
    try {
      const response = await api.Client.check_account();
      console.log(response);
      set_account_status(response);
      set_account_title(`${response.username}#${response.account_id}`);
    } catch (err) {
      set_account_status_error(err);
    }
  };

  useEffect(() => {
    api.Client.check_credential()
      .then(() => {
        get_account_status();
      })
      .catch(() => {
        navigate('/');
      });
  }, []);

  const tier_to_string = (tier: string): string => {
    const m: HumanConversion = {
      NORMAL: 'normal',
      PRIVILEGED: 'privileged',
      GAME_MASTER: 'game master',
      MODERATOR: 'moderator',
      ADMIN: 'administrator'
    };

    return m[tier] ? m[tier] : tier;
  };

  const tier_to_class = (tier: string): string => {
    const m: HumanConversion = {
      NORMAL: 'account-tier-normal',
      PRIVILEGED: 'account-tier-privileged',
      GAME_MASTER: 'account-tier-game-master',
      MODERATOR: 'account-tier-moderator',
      ADMIN: 'account-tier-administrator'
    };

    return m[tier] ? m[tier] : 'account-tier-normal';
  };

  const render_account_status_error_message = () => {
    if (account_status_error != '') {
      return (
        <p className='account-status-error-message'>{account_status_error}</p>
      );
    }
  };

  const format_unix_time = (unix_time: string): string => {
    if (unix_time == '') {
      return 'never';
    }
    const unix_seconds = +unix_time;
    const date = new Date(unix_seconds * 1000);
    return date.toDateString();
  };

  const account_properties: AccountProperty[] = [
    {
      name: 'Email address',
      key: 'email',
      value: account_status.email ? account_status.email : '<no email address>'
    },

    {
      name: 'Authorization tier',
      key: 'account_tier',
      value: account_status.account_tier
        ? tier_to_string(account_status.account_tier)
        : '<unknown>',
      value_class: account_status.account_tier
        ? tier_to_class(account_status.account_tier)
        : ''
    },

    {
      name: 'Created on',
      key: 'creation_date',
      value: account_status.creation_date
        ? format_unix_time(account_status.creation_date)
        : 'never'
    }
  ];

  const render_account_properties = () => {
    return account_properties.map((account_property) => {
      let name_class = ['account-property-name'];
      let value_class = ['account-property-value'];

      if (account_property.name_class) {
        name_class.push(account_property.name_class);
      }

      if (account_property.value_class) {
        value_class.push(account_property.value_class);
      }

      return (
        <div className='account-property'>
          <span className={name_class.join(' ')}>
            {account_property.name + ':'}
          </span>

          <span className={value_class.join(' ')}>
            {account_property.value}
          </span>
        </div>
      );
    });
  };

  const on_game_account_activate_click = (game_account: GameAccountStatus) => {
    return async () => {
      try {
        await api.Client.activate_game_account(game_account.id);

        account_status.game_accounts.map(
          (p_game_account: GameAccountStatus, index: number) => {
            if (p_game_account.id == game_account.id) {
              account_status.game_accounts[index].active = true;
              set_account_status(account_status);
              return;
            }
          }
        );

        get_account_status();
      } catch (err) {
        alert(`Failed to activate game account: ${err}`);
      }
    };
  };

  const on_game_account_delete_click = (game_account: GameAccountStatus) => {
    return async () => {
      const confirmation = prompt(
        `This action cannot be undone! Type 'DELETE MY GAME ACCOUNT' into the prompt if you really want to do this:`,
        ``
      );
      if (confirmation == `DELETE MY GAME ACCOUNT`) {
        try {
          await api.Client.delete_game_account(game_account.id);
          get_account_status();
        } catch (err) {
          alert(`Failed to delete game account: ${err}`);
        }
      }
    };
  };

  const on_game_account_rename_click = (game_account: GameAccountStatus) => {
    return async () => {
      const new_account_name = prompt(
        `Enter a new name for the game account '${game_account.name}'`,
        ``
      );
      if (new_account_name !== null && new_account_name != ``) {
        try {
          await api.Client.rename_game_account(game_account.id, {
            name: new_account_name
          });
          get_account_status();
        } catch (err) {
          alert(err);
        }
      }
    };
  };

  const render_game_account = (game_account: GameAccountStatus) => {
    const game_account_id = `${game_account.name}#${game_account.id}`;

    return (
      <div className='card'>
        <div className='account-panel'>
          <h1 className='account-title'>{game_account_id}</h1>

          <div className='game-account-buttons'>
            <button
              className='action-button action-button-destructive game-account-delete-button'
              onClick={on_game_account_delete_click(game_account)}
            >
              Delete
            </button>

            <button
              className='action-button game-account-rename-button'
              onClick={on_game_account_rename_click(game_account)}
            >
              Rename
            </button>

            <button
              className='action-button game-account-activate-button'
              data-action-enabled={game_account.active}
              onClick={on_game_account_activate_click(game_account)}
            >
              {game_account.active ? 'Active' : 'Activate'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const render_game_accounts = () => {
    if (account_status.game_accounts) {
      return account_status.game_accounts.map((game_account) => {
        return render_game_account(game_account);
      });
    }
  };

  const on_new_game_account_button_click = async () => {
    const new_game_account_name = prompt(
      'Enter a name to identify this new game account:'
    );
    if (new_game_account_name != '' && new_game_account_name !== null) {
      try {
        const response = await api.Client.new_game_account({
          name: new_game_account_name
        });
        get_account_status();
      } catch (err) {
        alert(`Failed to create game account: ${err}`);
      }
    }
  };

  return (
    <div className='card'>
      <div className='account-panel'>
        <h1 className='account-title'>{account_title}</h1>
        {render_account_status_error_message()}
        {render_account_properties()}
        <h1 className='account-title'>{`Game accounts (${account_status.game_accounts ? account_status.game_accounts.length : 0})`}</h1>
        <button
          className='form-button'
          onClick={on_new_game_account_button_click}
        >
          New game account
        </button>
        {render_game_accounts()}
      </div>
    </div>
  );
}
