// Libraries
import React, { useEffect, useState } from 'react';

import api from '../api';
import { VersionInfo } from '../api/models';

// Styles

import '../style/fonts.css';
import '../style/footer.css';

export default function Footer() {
  const [version_info, set_version_info] = useState<VersionInfo>({
    core_version: '0.0.0',
    brand: '',
    project_url: '#'
  });

  useEffect(() => {
    api.Client.version_info()
      .then((version_info) => {
        set_version_info(version_info);
      })
      .catch((err) => {});
  }, []);

  return (
    <div className='info-footer'>
      <a className='info-footer-project-link' href={version_info.project_url}>
        {version_info.brand}
      </a>
      <span> • </span>
      <span>{version_info.core_version}</span>
    </div>
  );
}
