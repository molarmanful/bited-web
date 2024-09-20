import extractorSvelte from '@unocss/extractor-svelte'
import {
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
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  safelist: [],
  theme: {},
  rules: [],
  shortcuts: [],
  extractors: [extractorSvelte],
}
