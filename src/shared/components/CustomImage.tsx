import React, { useState } from 'react';

type ImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string;
  lazy?: boolean;
  className?: string;
};

const CustomImage: React.FC<ImageProps> = ({
  src,
  alt,
  fallbackSrc,
  lazy = true,
  className,
  ...rest
}) => {
  const [errored, setErrored] = useState(false);

  const handleError = () => setErrored(true);

  const resolvedSrc = !errored && src ? (src as string) : fallbackSrc;

  return (
    <img
      src={resolvedSrc}
      alt={alt ?? ''}
      loading={lazy ? 'lazy' : undefined}
      onError={handleError}
      className={className}
      {...rest}
    />
  );
};

export default CustomImage;
