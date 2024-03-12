// Libraries
import * as React from 'react';
import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

import api from '../api';

// Styles
import '../style/fonts.css';
import '../style/nav.css';

type NavBarItem = {
  route: string;
  name: string;
};

const get_nav_list = (): NavBarItem[] => {
  if (api.Client.state == api.ClientState.CLIENT_UNAUTHENTICATED) {
    return [
      {
        route: '/',
        name: 'Home'
      },

      {
        route: '/register',
        name: 'Create Account'
      },

      {
        route: '/login',
        name: 'Login'
      }
    ];
  }

  return [
    {
      route: '/',
      name: 'Home'
    },

    {
      route: '/account',
      name: 'Account'
    },

    {
      route: '/logout',
      name: 'Log out'
    }
  ];
};

let checked_credential = false;

export default function NavBar() {
  const [nav_list, set_nav_list] = useState(get_nav_list());

  const location = useLocation();

  if (!checked_credential) {
    api.Client.check_credential()
      .then(() => {
        set_nav_list(get_nav_list());
        checked_credential = true;
      })
      .catch(() => {
        checked_credential = true;
      });
  }

  api.Client.on_state_change(() => {
    set_nav_list(get_nav_list());
  });

  return (
    <>
      <div className="nav-bar">
        {nav_list.map((nav_item) => {
          return (
            <Link
              className="nav-elem"
              data-active-page={location.pathname == nav_item.route}
              to={nav_item.route}
            >
              <p>{nav_item.name}</p>
            </Link>
          );
        })}
      </div>
      <Outlet />
    </>
  );
}
