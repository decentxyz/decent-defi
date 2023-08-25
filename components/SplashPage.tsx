import { PropsWithChildren } from 'react';
import clsx from 'clsx';
import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';
import styles from '@/styles/splash-animation.module.css';
import Image from 'next/image';

export const SplashPage = ({ children }: PropsWithChildren) => {
  return (
    <div>
      <nav
        className={clsx(
          'flex flex-wrap items-center justify-end gap-1',
          'fixed inset-0 bottom-auto z-10',
          'my-8 mx-4 md:mx-20'
        )}
      >
        <RainbowConnectButton />
      </nav>
      <div className="relative">
        <div className="bg-gradient-conic sticky top-0">
          <div
            className={clsx(
              'relative bg-gradient-grid-white bg-center',
              'grid place-items-center min-h-screen',
              styles.gridShrink
            )}
          >
            <div className="absolute m-8 top-0 left-0 flex gap-8 items-center">
              <Image
                src="/decent-icon-black.png"
                alt="Decent Logo"
                height={40}
                width={48}
                // priority
              />
              <p className="uppercase mx-auto text-3xl font-light">
                Click. Mint.
              </p>
            </div>
            {children}
            <h1
              className={clsx(
                'absolute left-0 right-0 bottom-0 flex items-center justify-center',
                'uppercase font-semibold tracking-widest',
                'text-5xl sm:text-7xl md:text-8xl lg:text-8xl',
                styles.titleGrow
              )}
            >
              The&nbsp;Box
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
};
