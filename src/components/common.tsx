import { PropsWithChildren, HTMLAttributes, ButtonHTMLAttributes } from 'react';

export const H2 = ({ children }: PropsWithChildren) => (
  <h1 className={'text-3xl mb-3'}>{children}</h1>
);

export const H1 = ({ children }: PropsWithChildren) => (
  <h1 className={'text-6xl mb-4'}>{children}</h1>
);

export const P = ({ children }: PropsWithChildren) => (
  <p className={'text-xl mb-2'}>{children}</p>
);

export const CodeBlock = ({
  children,
  className = '',
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={
      'max-w-6xl overflow-auto ' +
      'bg-indigo-100 p-3 rounded-2xl my-5 ' +
      className
    }
  >
    <pre>{children}</pre>
  </div>
);

export const Button = ({
  children,
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...p}
    className="border-none pl-4 pr-4 p-2 rounded bg-black text-white text-xl mb-5"
  >
    {children}
  </button>
);
