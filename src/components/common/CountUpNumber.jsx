import React, { useEffect, useState } from 'react';

export const CountUpNumber = ({
  end = 0,
  duration = 1000,
  suffix = '',
  prefix = ''
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const target = Number(end) || 0;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const current = Math.floor(progress * target);
      setCount(current);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    window.requestAnimationFrame(step);
  }, [end, duration]);

  return (
    <span>
      {prefix}{count}{suffix}
    </span>
  );
};
