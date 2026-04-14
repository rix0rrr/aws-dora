
export function forceString(x: string[] | string): string {
  if (typeof x === 'string') {
    return x;
  }
  if (x.length === 0) {
    throw new Error('Expected non-empty array');
  }
  return x[0];
}
