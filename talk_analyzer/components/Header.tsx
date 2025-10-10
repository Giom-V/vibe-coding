
import React from 'react';
import { APP_TITLE } from '../constants';

const Header: React.FC = () => {
  return (
    <header className="py-6 text-center">
      <h1 className="text-4xl font-bold text-sky-400">{APP_TITLE}</h1>
      <p className="mt-2 text-slate-400">
        Get AI-powered feedback on your public speaking.
      </p>
    </header>
  );
};

export default Header;
