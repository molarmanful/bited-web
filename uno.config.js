import extractorSvelte from '@unocss/extractor-svelte'
import {
  presetIcons,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default {
  presets: [
    presetUno(),
    presetWebFonts({
      provider: 'google',
      fonts: {
        sans1: [
          { name: 'Satoshi', weights: [400, 700], provider: 'fontshare' },
        ],
        mono: ['Fira Code'],
      },
    }),
    presetIcons({
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  safelist: [],
  theme: {
    colors: {
      fg: 'var(--c-fg)',
      bg: 'var(--c-bg)',
      bord: 'var(--c-bord)',
      dis: 'var(--c-dis)',
      sel: 'var(--c-sel)',
    },
  },
  rules: [],
  shortcuts: [],
  extractors: [extractorSvelte],
}
