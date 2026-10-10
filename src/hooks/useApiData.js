import { useCallback, useEffect, useState } from 'react';

// Loads data with `load()` whenever `deps` change; keeps the previous data on screen while reloading.
// Returns { data, loading, error, reload, setData }.
export default function useApiData(load, deps) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    setState((current) => ({ ...current, loading: true, error: null }));

    load()
      .then((data) => {
        if (!ignore) setState({ data, loading: false, error: null });
      })
      .catch((err) => {
        if (!ignore) setState({ data: null, loading: false, error: err.message });
      });

    return () => {
      ignore = true;
    };
    // `load` is a fresh closure every render; `deps` says when its inputs change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);
  const setData = useCallback(
    (update) =>
      setState((current) => ({ ...current, data: typeof update === 'function' ? update(current.data) : update })),
    []
  );

  return { ...state, reload, setData };
}
