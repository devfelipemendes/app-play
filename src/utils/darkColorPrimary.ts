/**
 * Escurece uma cor hexadecimal em um percentual
 * @param hex - cor em formato #RRGGBB
 * @param percent - quanto escurecer (0 a 100)
 */
export function darkenColor(hex: string, percent: number) {
  // Remove o #
  const cleanHex = hex.replace('#', '')
  const num = parseInt(cleanHex, 16)

  let r = (num >> 16) & 0xff
  let g = (num >> 8) & 0xff
  let b = num & 0xff

  r = Math.max(0, Math.min(255, Math.floor(r * (1 - percent / 100))))
  g = Math.max(0, Math.min(255, Math.floor(g * (1 - percent / 100))))
  b = Math.max(0, Math.min(255, Math.floor(b * (1 - percent / 100))))

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}
