import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function CopyIconButton({
  copyText,
  className = '',
}: {
  copyText: string;
  className?: string;
}) {
  const [success, setSuccess] = useState(false);
  useEffect(() => {
    if (success) setTimeout(() => setSuccess(false), 2000);
  }, [success]);

  const writeToClipboard = async () => {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(copyText);
      setSuccess(true);
    }
  };
  return (
    <button onClick={writeToClipboard} className={className}>
      {success ? (
        <Image
          className=""
          src="/circle-check.svg"
          width="13"
          height="13"
          alt=""
        />
      ) : (
        <Image className="" src="/copy.svg" width="13" height="13" alt="" />
      )}
    </button>
  );
}
