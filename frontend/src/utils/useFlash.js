import { useState, useRef, useEffect, useCallback } from 'react';

// Small success-message state that clears itself. Returns [message, flash].
export default function useFlash(ms = 4000) {
  const [message, setMessage] = useState('');
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const flash = useCallback(
    (text) => {
      setMessage(text);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setMessage(''), ms);
    },
    [ms]
  );
  return [message, flash];
}
