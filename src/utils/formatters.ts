export interface CurrencySettings {
  currency: 'IDR' | 'USD'
  symbolFormat: 'code' | 'symbol' // 'IDR' vs 'Rp' for IDR, 'USD' vs '$' for USD
  usdRate: number // e.g. 16000
  showDecimals: boolean // e.g. '...,00' toggle
}

export const DEFAULT_CURRENCY_SETTINGS: CurrencySettings = {
  currency: 'IDR',
  symbolFormat: 'code',
  usdRate: 16000,
  showDecimals: false,
}

export function getCurrencySettings(): CurrencySettings {
  try {
    const saved = localStorage.getItem('discash_currency_settings')
    if (saved) {
      return { ...DEFAULT_CURRENCY_SETTINGS, ...JSON.parse(saved) }
    }
  } catch {
    // ignore
  }
  return DEFAULT_CURRENCY_SETTINGS
}

export function saveCurrencySettings(settings: CurrencySettings): void {
  try {
    localStorage.setItem('discash_currency_settings', JSON.stringify(settings))
    window.dispatchEvent(new CustomEvent('discash_currency_changed', { detail: settings }))
  } catch {
    // ignore
  }
}

/**
 * Format a number dynamically based on user currency settings (IDR, USD, symbols, decimals)
 */
export function formatCurrency(amount: number, customSettings?: CurrencySettings): string {
  const settings = customSettings || getCurrencySettings()

  if (settings.currency === 'USD') {
    const rate = settings.usdRate > 0 ? settings.usdRate : 16000
    const usdAmount = amount / rate
    const prefix = settings.symbolFormat === 'symbol' ? '$' : 'USD '
    const formattedNumber = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: settings.showDecimals ? 2 : 0,
      maximumFractionDigits: settings.showDecimals ? 2 : 0,
    }).format(usdAmount)

    return `${prefix}${formattedNumber}`
  }

  // Default IDR
  const prefix = settings.symbolFormat === 'symbol' ? 'Rp ' : 'IDR '
  const formattedNumber = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: settings.showDecimals ? 2 : 0,
    maximumFractionDigits: settings.showDecimals ? 2 : 0,
  }).format(amount)

  return `${prefix}${formattedNumber}`
}

/**
 * Backward-compatible alias for existing codebase components
 */
export const formatIDR = formatCurrency

/**
 * Capitalize first letter of each word (Title Case) as user types
 */
export function toTitleCase(value: string): string {
  return value.replace(/(^|\s)\S/g, (char) => char.toUpperCase())
}

/**
 * Format string digits with thousand separators for currency input
 */
export function formatNumberInput(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  return new Intl.NumberFormat('id-ID').format(Number(digits))
}

