import SwapModal from "../components/SwapModal";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import Image from "next/image";

export default function Index() {
  return (
    <div className="px-8 bg-gray-100 min-h-screen relative">
      <div className="flex justify-between py-4 items-center">
        <a
          href="https://checkout.decent.xyz/"
          target="_blank"
          className="py-2 px-4 bg-white rounded-md drop-shadow-md font-medium flex items-center gap-2"
        >
          <div>
            <Image
              src="/decent-icon-black.png"
              height={20}
              width={20}
              alt="decent-icon"
            />
          </div>
          Buy Crypto
        </a>
        <ConnectButton />
      </div>
      <div className="w-full flex justify-center mt-4">
        <div className="sm:w-[480px]">
          <SwapModal />
        </div>
      </div>
      <div className="absolute bottom-4 flex w-full justify-center text-gray-500">
        <span className="pr-1">Powered by</span>
        <Link
          href="http://decent.xyz/"
          className="hover:opacity-80 hover:underline"
        >
          Decent
        </Link>
      </div>
    </div>
  );
}
