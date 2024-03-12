import * as React from 'react';

import '../style/card.css';
import '../style/home.css';

export default function Home() {
  return (
    <div className="card">
      <div className="home-landing">
        <img className="home-logo" />
        <h1 className="home-title">Gophercraft</h1>
      </div>
    </div>
  );
}
