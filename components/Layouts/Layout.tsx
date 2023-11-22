import React, { PropsWithChildren } from 'react';
import { NavBar } from '@/components/Layouts/NavBar';
import clsx from 'clsx';
import styles from '@/styles/splash-animation.module.css';

export const Layout = ({ children }: PropsWithChildren) => {
  return (
    <div>
      <NavBar />
      <div className="bg-gradient-conic sticky top-0 min-h-screen">
        <div
          className={clsx(
            'bg-gradient-grid-white bg-center',
            'grid place-items-center pt-36 min-h-screen',
            styles.gridShrink
          )}
        >
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
};
