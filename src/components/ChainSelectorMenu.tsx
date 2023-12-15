import { Fragment, useEffect } from "react";
import Image from "next/image";
import { Popover, Transition } from "@headlessui/react";
import { ChainId } from "@decent.xyz/box-common";
import { chainIcons, chainNames } from "../lib/contexts/routeSelectContext";
import { useSearchParams } from "next/navigation";
import { defaultAvailableChains } from "@/lib/constants";

export interface ChainSelectMenuProps {
  chainId: ChainId;
  onSelectChain: (chainId: ChainId) => void;
  availableChains?: ChainId[];
  renderBtnInner?: (name: string, iconSrc: string) => JSX.Element;
  className?: string;
  anchorToRight?: boolean;
}

export default function ChainSelectMenu({
  chainId,
  onSelectChain,
  availableChains = defaultAvailableChains,
  renderBtnInner,
  anchorToRight,
  className = "relative inline-block h-6",
}: ChainSelectMenuProps) {
  const searchParams = useSearchParams();
  useEffect(() => {
    const chain = searchParams.get("chain");
    if (availableChains.includes(Number(chain))) {
      onSelectChain(Number(chain));
    }
  }, [searchParams.get("chain")]);
  return (
    <Popover className={className}>
      {({ close }) => (
        <>
          <Popover.Button>
            {renderBtnInner ? (
              renderBtnInner(chainNames[chainId], chainIcons[chainId])
            ) : (
              <div className="border border-[#BEC3C9] rounded px-2 leading-none inline-flex items-baseline py-1.5">
                <span className="self-center">
                  <Image
                    className="w-3.5 h-3.5 object-contain"
                    width="14"
                    height="14"
                    alt={chainNames[chainId]}
                    src={chainIcons[chainId]}
                  />
                </span>
                <span className="ml-1">{chainNames[chainId]}</span>
              </div>
            )}
          </Popover.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel
              className={
                "absolute z-10 w-screen max-w-[11rem] px-4 top-full mt-2" +
                (anchorToRight ? " -right-4" : " -left-4")
              }
            >
              <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 bg-white py-2">
                {availableChains.map((c) => (
                  <button
                    key={c}
                    className={
                      "flex w-full items-center py-1 px-3" +
                      " focus:outline-none focus:ring focus:rounded-lg ring-inset" +
                      (c == chainId ? " bg-purple-light" : " hover:bg-seasalt")
                    }
                    onClick={() => {
                      onSelectChain(c);
                      close();
                    }}
                  >
                    <Image
                      className="w-3.5 h-3.5 object-contain"
                      width="14"
                      height="14"
                      src={chainIcons[c]}
                      alt={chainNames[c]}
                    />
                    <div className="ml-1">{chainNames[c]}</div>
                  </button>
                ))}
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}
