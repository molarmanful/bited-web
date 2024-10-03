import extractorSvelte from '@unocss/extractor-svelte'
import {
  presetIcons,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

const clr = s => `rgba(var(--c-${s}))`

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
      fg: clr('fg'),
      bg: clr('bg'),
      bord: clr('bord'),
      dis: clr('dis'),
      sel: clr('sel'),
    },
  },
  rules: [],
  shortcuts: [],
  extractors: [extractorSvelte],
}
