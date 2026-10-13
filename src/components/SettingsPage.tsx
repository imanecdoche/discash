import { useState } from 'react'
import {
  type CurrencySettings,
  formatCurrency,
  formatNumberInput,
} from '../utils/formatters'
import { TabHeader } from './TabHeader'

interface SettingsPageProps {
  settings: CurrencySettings
  onUpdateSettings: (newSettings: CurrencySettings) => void
  className?: string
}

export function SettingsPage({
  settings,
  onUpdateSettings,
  className = '',
}: SettingsPageProps) {
  const [usdRateString, setUsdRateString] = useState(() =>
    new Intl.NumberFormat('id-ID').format(settings.usdRate || 16000)
  )

  const handleCurrencyChange = (currency: 'IDR' | 'USD') => {
    onUpdateSettings({
      ...settings,
      currency,
    })
  }

  const handleSymbolFormatChange = (symbolFormat: 'code' | 'symbol') => {
    onUpdateSettings({
      ...settings,
      symbolFormat,
    })
  }

  const handleUsdRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/\D/g, '')
    const formatted = formatNumberInput(rawDigits)
    setUsdRateString(formatted)

    const numericRate = Number(rawDigits)
    if (numericRate > 0) {
      onUpdateSettings({
        ...settings,
        usdRate: numericRate,
      })
    }
  }

  const handleToggleDecimals = () => {
    onUpdateSettings({
      ...settings,
      showDecimals: !settings.showDecimals,
    })
  }

  return (
    <div className={`w-full flex flex-col gap-4 pb-6 select-none ${className}`}>
      <TabHeader title="Settings" />

      {/* Settings Card Shell */}
      <section
        aria-label="App Settings"
        className="overflow-hidden rounded-2xl bg-[#2B2D31] border border-[#1F2023]/80 p-5 shadow-xl flex flex-col gap-5 select-none"
      >
        {/* Header Section */}
        <div className="flex flex-col gap-1 border-b border-[#1F2023]/70 pb-3">
          <p className="text-xs text-[#949BA4]">
            Currency & Display Configuration
          </p>
        </div>

        {/* 1. Pemilihan Mata Uang (IDR & USD) */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#949BA4]">
            Currency / Mata Uang
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleCurrencyChange('IDR')}
              className={`min-h-[46px] py-2.5 px-3.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all select-none cursor-pointer ${
                settings.currency === 'IDR'
                  ? 'bg-gradient-to-b from-[#6975F7] to-[#4752C4] text-white ring-2 ring-[#1E1F22] border-b-[3.5px] border-[#363FA0] active:translate-y-0.5 active:border-b-[1.5px] active:scale-[0.99]'
                  : 'bg-[#1E1F22] border border-[#111214]/80 text-[#949BA4] hover:text-[#DBDEE1] hover:bg-[#232428] active:scale-[0.99]'
              }`}
              style={
                settings.currency === 'IDR'
                  ? {
                      boxShadow:
                        'inset 0 1.5px 2px rgba(255, 255, 255, 0.45), 0 4px 16px rgba(88, 101, 242, 0.4)',
                    }
                  : undefined
              }
            >
              {settings.currency === 'IDR' ? (
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4 text-white shrink-0 drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.35)]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <span className="w-4 h-4 shrink-0" aria-hidden="true" />
              )}
              <span className={settings.currency === 'IDR' ? 'drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.3)]' : ''}>
                IDR (Rupiah)
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleCurrencyChange('USD')}
              className={`min-h-[46px] py-2.5 px-3.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all select-none cursor-pointer ${
                settings.currency === 'USD'
                  ? 'bg-gradient-to-b from-[#6975F7] to-[#4752C4] text-white ring-2 ring-[#1E1F22] border-b-[3.5px] border-[#363FA0] active:translate-y-0.5 active:border-b-[1.5px] active:scale-[0.99]'
                  : 'bg-[#1E1F22] border border-[#111214]/80 text-[#949BA4] hover:text-[#DBDEE1] hover:bg-[#232428] active:scale-[0.99]'
              }`}
              style={
                settings.currency === 'USD'
                  ? {
                      boxShadow:
                        'inset 0 1.5px 2px rgba(255, 255, 255, 0.45), 0 4px 16px rgba(88, 101, 242, 0.4)',
                    }
                  : undefined
              }
            >
              {settings.currency === 'USD' ? (
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4 text-white shrink-0 drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.35)]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <span className="w-4 h-4 shrink-0" aria-hidden="true" />
              )}
              <span className={settings.currency === 'USD' ? 'drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.3)]' : ''}>
                USD (Dollar)
              </span>
            </button>
          </div>
        </div>

        {/* 2. Pemilihan Simbol Mata Uang */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#949BA4]">
            Symbol Format / Tampilan Simbol
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            {settings.currency === 'IDR' ? (
              <>
                <button
                  type="button"
                  onClick={() => handleSymbolFormatChange('code')}
                  className={`min-h-[44px] py-2 px-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-all select-none cursor-pointer ${
                    settings.symbolFormat === 'code'
                      ? 'bg-gradient-to-b from-[#6975F7] to-[#4752C4] text-white ring-2 ring-[#1E1F22] border-b-[3.5px] border-[#363FA0] active:translate-y-0.5 active:border-b-[1.5px] active:scale-[0.99]'
                      : 'bg-[#1E1F22] border border-[#111214]/80 text-[#949BA4] hover:text-[#DBDEE1] hover:bg-[#232428] active:scale-[0.99]'
                  }`}
                  style={
                    settings.symbolFormat === 'code'
                      ? {
                          boxShadow:
                            'inset 0 1.5px 2px rgba(255, 255, 255, 0.45), 0 4px 16px rgba(88, 101, 242, 0.4)',
                        }
                  : undefined
                  }
                >
                  {settings.symbolFormat === 'code' ? (
                    <svg
                      viewBox="0 0 24 24"
                      className="w-3.5 h-3.5 text-white shrink-0 drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.35)]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  )}
                  <span className={settings.symbolFormat === 'code' ? 'drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.3)]' : ''}>
                    IDR (Kode)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSymbolFormatChange('symbol')}
                  className={`min-h-[44px] py-2 px-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-all select-none cursor-pointer ${
                    settings.symbolFormat === 'symbol'
                      ? 'bg-gradient-to-b from-[#6975F7] to-[#4752C4] text-white ring-2 ring-[#1E1F22] border-b-[3.5px] border-[#363FA0] active:translate-y-0.5 active:border-b-[1.5px] active:scale-[0.99]'
                      : 'bg-[#1E1F22] border border-[#111214]/80 text-[#949BA4] hover:text-[#DBDEE1] hover:bg-[#232428] active:scale-[0.99]'
                  }`}
                  style={
                    settings.symbolFormat === 'symbol'
                      ? {
                          boxShadow:
                            'inset 0 1.5px 2px rgba(255, 255, 255, 0.45), 0 4px 16px rgba(88, 101, 242, 0.4)',
                        }
                  : undefined
                  }
                >
                  {settings.symbolFormat === 'symbol' ? (
                    <svg
                      viewBox="0 0 24 24"
                      className="w-3.5 h-3.5 text-white shrink-0 drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.35)]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  )}
                  <span className={settings.symbolFormat === 'symbol' ? 'drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.3)]' : ''}>
                    Rp (Simbol)
                  </span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleSymbolFormatChange('symbol')}
                  className={`min-h-[44px] py-2 px-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-all select-none cursor-pointer ${
                    settings.symbolFormat === 'symbol'
                      ? 'bg-gradient-to-b from-[#6975F7] to-[#4752C4] text-white ring-2 ring-[#1E1F22] border-b-[3.5px] border-[#363FA0] active:translate-y-0.5 active:border-b-[1.5px] active:scale-[0.99]'
                      : 'bg-[#1E1F22] border border-[#111214]/80 text-[#949BA4] hover:text-[#DBDEE1] hover:bg-[#232428] active:scale-[0.99]'
                  }`}
                  style={
                    settings.symbolFormat === 'symbol'
                      ? {
                          boxShadow:
                            'inset 0 1.5px 2px rgba(255, 255, 255, 0.45), 0 4px 16px rgba(88, 101, 242, 0.4)',
                        }
                  : undefined
                  }
                >
                  {settings.symbolFormat === 'symbol' ? (
                    <svg
                      viewBox="0 0 24 24"
                      className="w-3.5 h-3.5 text-white shrink-0 drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.35)]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  )}
                  <span className={settings.symbolFormat === 'symbol' ? 'drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.3)]' : ''}>
                    $ (Simbol Dolar)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSymbolFormatChange('code')}
                  className={`min-h-[44px] py-2 px-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-all select-none cursor-pointer ${
                    settings.symbolFormat === 'code'
                      ? 'bg-gradient-to-b from-[#6975F7] to-[#4752C4] text-white ring-2 ring-[#1E1F22] border-b-[3.5px] border-[#363FA0] active:translate-y-0.5 active:border-b-[1.5px] active:scale-[0.99]'
                      : 'bg-[#1E1F22] border border-[#111214]/80 text-[#949BA4] hover:text-[#DBDEE1] hover:bg-[#232428] active:scale-[0.99]'
                  }`}
                  style={
                    settings.symbolFormat === 'code'
                      ? {
                          boxShadow:
                            'inset 0 1.5px 2px rgba(255, 255, 255, 0.45), 0 4px 16px rgba(88, 101, 242, 0.4)',
                        }
                  : undefined
                  }
                >
                  {settings.symbolFormat === 'code' ? (
                    <svg
                      viewBox="0 0 24 24"
                      className="w-3.5 h-3.5 text-white shrink-0 drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.35)]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  )}
                  <span className={settings.symbolFormat === 'code' ? 'drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.3)]' : ''}>
                    USD (Kode)
                  </span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* 3. Kurs USD (Nilai Tukar) */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="usd-rate-input" className="text-[11px] font-bold uppercase tracking-wider text-[#949BA4]">
            Kurs USD (1 USD = IDR)
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-xs font-bold text-[#949BA4] pointer-events-none">
              IDR
            </span>
            <input
              id="usd-rate-input"
              type="text"
              inputMode="numeric"
              value={usdRateString}
              onChange={handleUsdRateChange}
              placeholder="16.000"
              className="w-full bg-[#1E1F22] border border-[#1F2023] rounded-xl pl-12 pr-4 py-3 text-sm font-semibold text-[#DBDEE1] focus:border-[#5865F2] focus:ring-1 focus:ring-[#5865F2] outline-none transition-colors"
            />
          </div>
          <span className="text-[11px] text-[#949BA4]">
            Digunakan untuk kalkulasi konversi saat mata uang USD aktif.
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-[#1F2023]/70" />

        {/* 4. Toggle Desimal (misal "...,00") */}
        <div className="flex items-center justify-between py-1">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[#E0E1E5]">
              Decimal Digits
            </span>
            <span className="text-xs text-[#949BA4]">
              Tampilkan desimal 2 digit ({settings.currency === 'IDR' ? '...,00' : '.00'})
            </span>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={settings.showDecimals}
            onClick={handleToggleDecimals}
            className={`w-13 h-7.5 rounded-full p-1 transition-all relative cursor-pointer shrink-0 select-none ring-2 ring-[#1E1F22] active:scale-[0.97] ${
              settings.showDecimals
                ? 'bg-gradient-to-b from-[#6975F7] to-[#4752C4] border-b-[2px] border-[#363FA0]'
                : 'bg-gradient-to-b from-[#35373C] to-[#2B2D31] border-b-[2px] border-[#1F2023]'
            }`}
            style={{
              boxShadow: settings.showDecimals
                ? 'inset 0 1.5px 2px rgba(255, 255, 255, 0.4), 0 4px 14px rgba(88, 101, 242, 0.45)'
                : 'inset 0 1.5px 2px rgba(0, 0, 0, 0.45)',
            }}
          >
            <div
              className={`w-5.5 h-5.5 rounded-full bg-gradient-to-b from-white to-[#E0E1E5] border-b-[2.5px] border-[#B5BAC1] transform transition-transform ${
                settings.showDecimals ? 'translate-x-5.5' : 'translate-x-0'
              }`}
              style={{
                boxShadow:
                  'inset 0 1.5px 1.5px rgba(255, 255, 255, 0.9), 0 3px 6px rgba(0, 0, 0, 0.35)',
              }}
            />
          </button>
        </div>

        {/* 5. Live Preview */}
        <div className="pt-3 border-t border-[#1F2023]/70 flex items-center justify-between">
          <span className="text-xs font-semibold text-[#949BA4]">
            Preview Format:
          </span>
          <span className="text-sm font-bold text-[#23A55A] font-mono">
            {formatCurrency(58000, settings)}
          </span>
        </div>
      </section>
    </div>
  )
}
