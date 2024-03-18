// Libraries

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import api from '../api';
import { RealmStatusList, VersionInfo } from '../api/models';
// Components

import Footer from './Footer';

// Styles

import '../style/card.css';
import '../style/home.css';

export default function Home() {
  const [version_info, set_version_info] = useState<VersionInfo>({
    core_version: '0.0.0',
    brand: '',
    project_url: '#'
  });

  const [realm_status_list, set_realm_status_list] = useState<RealmStatusList>({
    // realms: [
    //   {
    //     id: '1',
    //     name: 'Archimonde',
    //     online: true,
    //     build: '1.12.1.5875',
    //     expansion: 1,
    //     description: 'Balanced PVP vanilla realm'
    //   },
    //   {
    //     id: '2',
    //     name: 'Fun',
    //     online: false,
    //     build: '1.12.1.5875',
    //     expansion: 1,
    //     description: 'all-gm vanilla realm'
    //   }
    // ]
  });

  const get_realm_status_list = async () => {
    try {
      const response = await api.Client.realm_status_list();
      set_realm_status_list(response);
    } catch (err) {
      console.log(`error fetching realm status list: ${err}`);
    }
  };

  useEffect(() => {
    const interval = setInterval(() =>  {
        get_realm_status_list();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    api.Client.version_info()
      .then((version_info) => {
        set_version_info(version_info);
      })
      .catch((err) => {});
  }, []);

  const render_realm_status_list = () => {
    if (typeof realm_status_list.realms !== 'undefined') {
      const realm_statuses = realm_status_list.realms.map(
        (realm_status, index) => {
          const line_between = () => {
            if (index < realm_status_list.realms.length - 1) {
              return <hr className='realm-status-divider' />;
            }
          };

          return (
            <>
              <div className='realm-status'>
                <div className='realm-status-title'>
                  <h1 className='realm-status-name'>{`${realm_status.name}#${realm_status.id}`}</h1>
                  <img
                    className={`realm-status-availability-icon ${realm_status.online ? 'realm-status-availability-icon-online' : 'realm-status-availability-icon-offline'}`}
                  />
                </div>
                <div className='realm-status-version'>
                  <p className='realm-status-build'>{realm_status.build}</p>
                  <img
                    className={`realm-status-expansion-icon realm-status-expansion-icon-${realm_status.expansion}`}
                  />
                </div>
                <Link
                  className='realm-connection-guide-link'
                  to={`/connection-guide/${realm_status.build}`}
                >
                  How to connect
                </Link>
                <p className='realm-status-description'>
                  {realm_status.description}
                </p>
              </div>
              {/* {line_between()} */}
            </>
          );
        }
      );

      if (realm_statuses.length > 0) {
        return (
          <div className='card'>
            <div className='realm-status-list'>{realm_statuses}</div>
          </div>
        );
      }
    }
  };

  return (
    <>
      <div className='home-landing'>
        <img className='home-logo' />
        <h1 className='home-title'>{version_info.brand}</h1>
      </div>
      {render_realm_status_list()}
    </>
  );
}
