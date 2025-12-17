import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import { defineConfig } from 'eslint/config'

export default defineConfig([
    {
        files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
        plugins: { js },
        ignores: [
            'node_modules/**',
            'dist/**',
            'build/**',
            'coverage/**',
            '*.config.js',
            '*.config.ts',
        ],
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        languageOptions: { globals: globals.node },
        rules: {
            'no-console': 'warn',
        },
    },
    tseslint.configs.recommended,
])
