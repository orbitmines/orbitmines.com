// Ether host detection.
// Production: ether.orbitmines.com is the ether host; orbitmines.com is not.
// Local:      127.0.0.1 mirrors ether.*;  localhost mirrors orbitmines.com.

export function isEtherHost(hostname: string = window.location.hostname): boolean {
  return hostname === 'ether.orbitmines.com' || hostname === '127.0.0.1';
}
