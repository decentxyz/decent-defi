import { useBoxAction, UseBoxActionArgs } from '@decent.xyz/box-hooks';
import {
  PropsWithChildren,
  createContext,
  useState,
} from 'react';

type UseBoxActionReturn = ReturnType<typeof useBoxAction>;

type BoxActionContextProps = {
  setBoxActionArgs: (boxActionArgs: UseBoxActionArgs | undefined) => void;
  boxActionArgs: UseBoxActionArgs | undefined;
  boxActionResponse: Omit<UseBoxActionReturn, 'ActionRequest'>;
};

export const BoxActionContext = createContext<BoxActionContextProps>({
  setBoxActionArgs: () => {},
  boxActionArgs: undefined,
  boxActionResponse: {
    isLoading: false,
    actionResponse: undefined,
    error: undefined,
  },
});

export const BoxActionContextProvider = ({
  children,
}: PropsWithChildren) => {
  const [boxActionArgs, setBoxActionArgs] = useState<UseBoxActionArgs>();
  const boxActionResponse = useBoxAction(boxActionArgs);

  const value = {
    setBoxActionArgs,
    boxActionArgs,
    boxActionResponse,
  };

  return (
    <BoxActionContext.Provider value={value}>
      {children}
    </BoxActionContext.Provider>
  );
};