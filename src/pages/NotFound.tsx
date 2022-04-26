import React, { FC } from 'react';
import { Link } from 'react-router-dom';

export const NotFound: FC = () => {
  return (
    <div style={{ margin: '0px auto', textAlign: 'center' }}>
      <h1>Oops!</h1>
      <p>404 - Page Not Found!</p>
      <Link to='/'>
        <button className='primaryButton'>Back To Home</button>
      </Link>
    </div>
  );
};
