import antfu from '@antfu/eslint-config'

export default antfu(
  {
    stylistic: true,
    svelte: {
      'overrides': {
        'svelte/sort-attributes': 1,
      },
      'svelte/html-self-closing': [1, {
        void: 'always',
        normal: 'never',
        component: 'always',
        svelte: 'always',
      }],
    },
    unocss: true,
    formatters: {
      css: true,
      html: true,
    },
    ignores: ['src/lib/uc'],
  },
  {
    rules: {
      'antfu/top-level-function': 0,
      'perfectionist/sort-imports': [2, {
        groups: [
          'type',
          ['parent-type', 'sibling-type', 'index-type'],

          'builtin',
          'external',
          ['internal', 'internal-type'],
          ['parent', 'sibling', 'index'],
          'side-effect',
          'object',
          'unknown',
        ],
        newlinesBetween: 'always',
        type: 'natural',
      }],
    },
  },
)
