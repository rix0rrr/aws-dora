export function sortByKey<A>(array: A[], keyFn: (x: A) => Array<string | number>): A[] {
  return array.sort((a, b) => {
    const keysA = keyFn(a);
    const keysB = keyFn(b);
    for (let i = 0; i < Math.min(keysA.length, keysB.length); i++) {
      if (keysA[i] < keysB[i]) return -1;
      if (keysA[i] > keysB[i]) return 1;
    }
    return keysA.length - keysB.length;
  });
}