const filter = <T>(fn: (x: T) => boolean) =>
  function* (iterable: Iterable<T>) {
    for (const x of iterable) if (fn(x)) yield x;
  };

export default filter;
