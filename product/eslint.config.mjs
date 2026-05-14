// @ts-check
import antfu from '@antfu/eslint-config'

// Single source of formatting + style truth. Antfu's defaults are
// already opinionated (no semi, single quotes, sorted imports). We
// only deviate where the framework or codebase demands it.
export default antfu({
  type: 'app',
  vue: true,
  typescript: true,
  jsonc: true,
  yaml: true,
  // Nuxt generates types into .nuxt/; let the gitignore cover it.
  gitignore: true,
  ignores: [
    '.nuxt/**',
    '.output/**',
    'node_modules/**',
    'public/**',
    '.data/**',
    'shared/**/*.gen.ts',
  ],
  stylistic: {
    indent: 2,
    quotes: 'single',
  },
}, {
  // Project-wide rule tweaks that don't fit antfu's defaults.
  rules: {
    // Auto-import-heavy Nuxt project; the rule fires for ref/computed/etc.
    'ts/no-use-before-define': 'off',
    'no-use-before-define': 'off',
    // rstore + Vue templates frequently use single-word names (Row, AwardFlash);
    // antfu's rule is correct for libraries, noisy for a Nuxt app.
    'vue/multi-word-component-names': 'off',
    // The MarqueeTicker uses the deprecated <marquee> on purpose.
    'vue/no-deprecated-html-element-is': 'off',
    // Allow leading underscores for "intentionally unused" args.
    'unused-imports/no-unused-vars': ['warn', {
      vars: 'all',
      varsIgnorePattern: '^_',
      args: 'after-used',
      argsIgnorePattern: '^_',
      ignoreRestSiblings: true,
    }],
    // Many Nuxt helpers (definePageMeta) and rstore macros run at the
    // top of a Vue setup block as statements; that's idiomatic, not a smell.
    'ts/no-floating-promises': 'off',
    // The Nuxt auto-import set is enormous; cross-file ordering buys little.
    'perfectionist/sort-imports': 'off',
  },
})
