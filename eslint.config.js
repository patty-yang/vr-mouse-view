import antfu from '@antfu/eslint-config'

export default antfu(
  {
    formatters: true,
    stylistic: {
      quotes: 'single',
      semi: false
    },
    vue: true
  },
  {
    rules: {
      'style/comma-dangle': ['error', 'never'],
      'style/quote-props': ['error', 'as-needed']
    }
  }
)
