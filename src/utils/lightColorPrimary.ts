/**
 * Clareia uma cor hexadecimal
 * @param hex - cor no formato '#RRGGBB'
 * @param percent - quanto clarear (0 a 100)
 */
export function lightenHexColor(hex: string, percent: number) {
  // Remove o #
  const normalized = hex.replace('#', '')

  // Converte para RGB
  const num = parseInt(normalized, 16)
  let r = (num >> 16) & 0xff
  let g = (num >> 8) & 0xff
  let b = num & 0xff

  // Aumenta cada canal com base na porcentagem
  r = Math.min(255, Math.floor(r + (255 - r) * (percent / 100)))
  g = Math.min(255, Math.floor(g + (255 - g) * (percent / 100)))
  b = Math.min(255, Math.floor(b + (255 - b) * (percent / 100)))

  // Retorna em hexadecimal
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}
