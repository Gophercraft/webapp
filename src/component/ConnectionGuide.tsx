// Libraries
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import api from '../api';
import SemVer from '../util/SemVer';
import { ServiceAddresses } from '../api/models';

// Styles

import '../style/card.css';
import '../style/fonts.css';
import '../style/connection-guide.css';

const grunt_removed_build = 16016;

export default function ConnectionGuide() {
  const { version } = useParams();
  const semver_version = new SemVer(version);

  const [service_addresses, set_service_addresses] = useState<ServiceAddresses>(
    {}
  );

  useEffect(() => {
    api.Client.service_addresses()
      .then((response) => {
        set_service_addresses(response);
      })
      .catch(() => {});
  }, []);

  const render_help_text = () => {
    if (typeof service_addresses.addresses !== 'undefined') {
      let help_text = '';
      if (semver_version.build < grunt_removed_build) {
        help_text = 'Put the following line into your realmlist.WTF:';
      } else {
        help_text = 'Put the following line into your WTF/Config.WTF:';
      }

      return <p className='connection-guide-text'>{help_text}</p>;
    }
  };

  const render_wtf_config = () => {
    if (typeof service_addresses.addresses !== 'undefined') {
      let wtf_text = '';
      if (semver_version.build < grunt_removed_build) {
        const grunt_address = service_addresses.addresses['grunt'];
        wtf_text = `SET realmList ${grunt_address ? grunt_address : 'localhost'}\n`;
      } else {
        const bnet_rpc_address = service_addresses.addresses['grunt'];
        wtf_text = `SET portal ${bnet_rpc_address ? bnet_rpc_address : 'localhost'}\n`;
      }

      return (
        <textarea className='connection-guide-wtf' readOnly>
          {wtf_text}
        </textarea>
      );
    }
  };

  return (
    <div className='card'>
      <div className='connection-guide'>
        <h1 className='connection-guide-title'>
          Connection guide for {version}
        </h1>
        {render_help_text()}
        {render_wtf_config()}
      </div>
    </div>
  );
}
