// Libraries

import React, { useEffect } from 'react';
import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';

import api from '../api';

// Components

import Footer from './Footer';

// Styles

import '../style/fonts.css';
import '../style/nav.css';

type NavBarItem = {
  key: string;
  route: string;
  name: string;
};

const get_nav_list = (): NavBarItem[] => {
  if (api.Client.state == api.ClientState.CLIENT_UNAUTHENTICATED) {
    return [
      {
        key: 'home',
        route: '/',
        name: 'Home'
      },

      {
        key: 'register',
        route: '/register',
        name: 'Create Account'
      },

      {
        key: 'login',
        route: '/login',
        name: 'Login'
      }
    ];
  }

  return [
    {
      key: 'home',
      route: '/',
      name: 'Home'
    },

    {
      key: 'account',
      route: '/account',
      name: 'Account'
    },

    {
      key: 'logout',
      route: '/logout',
      name: 'Log out'
    }
  ];
};

export default function NavBar() {
  const [nav_list, set_nav_list] = useState(get_nav_list());

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    api.Client.check_credential()
      .then(() => {
        set_nav_list(get_nav_list());
      })
      .catch(() => {
        navigate('/');
      });
  }, []);

  api.Client.on_state_change(() => {
    set_nav_list(get_nav_list());
  });

  return (
    <>
      <div className='nav-bar'>
        {nav_list.map((nav_item) => {
          return (
            <Link
              key={nav_item.key}
              className='nav-elem'
              data-active-page={location.pathname == nav_item.route}
              to={nav_item.route}
            >
              <p>{nav_item.name}</p>
            </Link>
          );
        })}
      </div>
      <Outlet />
      <Footer />
    </>
  );
}
