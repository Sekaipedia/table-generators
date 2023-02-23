const map = <T>(fn: (x: T) => boolean) =>
  function* (iterable: Iterable<T>) {
    for (const x of iterable) yield fn(x);
  };

export default map;
