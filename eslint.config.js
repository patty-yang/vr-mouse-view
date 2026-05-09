import antfu from '@antfu/eslint-config'

export default antfu({
  formatters: true,
  rules: {
    semi: ['error', 'never'],
    'comma-dangle': ['error', 'never'],
    quotes: ['error', 'single', { avoidEscape: true }]
  },
  vue: true
})
