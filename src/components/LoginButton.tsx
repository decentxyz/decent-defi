import { Fragment, useEffect } from 'react';
import Image from 'next/image';
import { Menu, Transition } from '@headlessui/react';
import { User, usePrivy, useWallets } from '@privy-io/react-auth';
import { usePrivyWagmi } from '@privy-io/wagmi-connector';
import usePrivyAddress from '../lib/hooks/usePrivyAddress';
import shortenAddress from '../lib/shortenAddress';
import CopyIconButton from './CopyIconButton';

export default function LoginButton() {
  const { ready, authenticated, user, login, logout, exportWallet } =
    usePrivy();
  const {wallets} = useWallets();
  const {wallet: activeWallet, setActiveWallet} = usePrivyWagmi();

  useEffect(() => {
    if (ready) {
      setActiveWallet(wallets[0]);
      console.log('setActiveWallet');
    }
  }, []);
  console.log("Active wallet: ", activeWallet);

  if (!ready) {
    return null;
  }

  if (!authenticated || !user) {
    return (
      <button
        onClick={login}
        className="bg-black text-white hover:bg-opacity-80 px-5 py-2 rounded-md"
      >
        Connect Wallet
      </button>
    );
  }

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div className="flex items-center gap-1.5 bg-white rounded border group">
        <Menu.Button className="flex items-center gap-1.5 py-1.5 pl-2 cursor-pointer">
          <LoginImage user={user} />
          <span className="leading-none">
            {shortenAddress(user?.wallet?.address)}
          </span>
        </Menu.Button>
        <CopyIconButton
          copyText={user?.wallet?.address ?? ''}
          className="self-stretch pr-2 group-hover:opacity-100 group-focus-within:opacity-100 opacity-0 transition"
        />
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={
            'absolute right-0 mt-1 flex flex-col w-56' +
            ' z-10 bg-white rounded-lg shadow-tooltip border divide-y'
          }
        >
          <div className="p-3">
            <div className="text-gray-mid">Signed in as</div>
            <div>
              {user.email && <div>{user.email?.address}</div>}
              {user.apple && <div>{user.apple?.email}</div>}
              {user.github && <div>{user.github?.username}</div>}
              {user.google && <div>{user.google?.email}</div>}
              {user.twitter && <div>{user.twitter?.username}</div>}
              {user.wallet && (
                <a
                  href={'https://etherscan.io/address/' + user.wallet?.address}
                  className="flex"
                  target="_blank"
                >
                  {/* TODO: link goes where? */}
                  <span className="">
                    {shortenAddress(user.wallet?.address, 9)}
                  </span>
                  <Image
                    alt="open in new tab"
                    className="ml-auto mb-0.5"
                    src="/link.svg"
                    width="12"
                    height="12"
                  />
                </a>
              )}
            </div>
          </div>

          {authenticated && (
            <Menu.Item>
              <button
                className="p-3 active:text-black text-left hover:bg-seasalt"
                onClick={exportWallet}
              >
                Export Wallet
              </button>
            </Menu.Item>
          )}
          <Menu.Item>
            <button
              className="p-3 text-left text-gray-mid flex items-center hover:bg-seasalt"
              onClick={logout}
            >
              Disconnect Wallet
              <Image
                alt=""
                className="ml-auto mb-0.5 text-gray-mid"
                src="/leave.svg"
                width="12"
                height="12"
              />
            </button>
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

function LoginImage({ user }: { user: User | null }) {
  if (!user) return null;

  if (user.google)
    return (
      <Image className="" src="/gmail.png" width="18" height="14" alt="" />
    );

  if (user.twitter)
    return <Image className="" src="/x.svg" width="14" height="14" alt="" />;

  if (user.apple)
    return (
      <Image className="" src="/apple.svg" width="11" height="13" alt="" />
    );
  if (user.github)
    return (
      <Image className="" src="/github.svg" width="16" height="16" alt="" />
    );

  if (user.wallet?.walletClientType == 'metamask')
    return (
      <Image className="" src="/metamask.png" width="16" height="16" alt="" />
    );

  if (user.wallet?.walletClientType == 'privy')
    return (
      <Image className="" src="/privy.png" width="16" height="16" alt="" />
    );
}