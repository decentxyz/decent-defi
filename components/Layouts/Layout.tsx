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
          <h1
            className={clsx(
              'flex items-center justify-center',
              'uppercase font-semibold tracking-widest',
              'text-5xl sm:text-7xl md:text-8xl lg:text-8xl pt-10 mb-0',
              styles.titleGrow
            )}
          >
            The&nbsp;Box
          </h1>
        </div>
      </div>
    </div>
  );
};
