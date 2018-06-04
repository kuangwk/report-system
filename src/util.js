export function getHash(key) {
  const match = window.location.href.match(`${key}=([^&?#]*)`)
  return match ? match[1] : ''
}