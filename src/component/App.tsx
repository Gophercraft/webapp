// Libraries
import * as React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Components
import NavBar from './NavBar';
import Home from './Home';
import Login from './Login';
import Logout from './Logout';
import Register from './Register';
import Account from './Account';
import ConnectionGuide from './ConnectionGuide';
import Authenticate from './Authenticate';
import AuthenticatorSetup from './AuthenticatorSetup';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<NavBar />}>
          <Route index element={<Home />} />
          <Route path='/register' element={<Register />} />
          <Route path='/login' element={<Login />} />
          <Route path='/logout' element={<Logout />} />
          <Route path='/account' element={<Account />} />
          <Route path='/authenticate' element={<Authenticate />} />
          <Route path='/setup-authenticator' element={<AuthenticatorSetup />} />
          <Route
            path='/connection-guide/:version'
            element={<ConnectionGuide />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
