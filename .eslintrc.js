/** @type {import('eslint').ESLint.ConfigData} */
module.exports = {
  root: true,
  env: {
    browser: true,
    node: false,
    jquery: true,
    es6: true,
    es2020: true,
    es2021: true,
    es2022: true,
  },
  plugins: [
    '@stylistic',
    '@typescript-eslint',
    'react',
    'vue',
  ],
  parser: '@typescript-eslint/parser',
  'extends': [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/stylistic',
    'plugin:react/recommended',
    'plugin:vue/vue3-recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    requireConfigFile: false,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  globals: {
    mw: 'readonly',
    mediaWiki: 'readonly',
    OO: 'readonly',
    localforage: 'readonly',
    moment: 'readonly',
    LocalObjectStorage: 'readonly',
    insertToBottomRightCorner: 'readonly',
    wgULS: 'readonly',
    wgUVS: 'readonly',
    hashwasm: 'readonly',
    oouiDialog: 'readonly',
    echarts: 'readonly',
    AsyncLock: 'readonly',
    MOE_SKIN_GLOBAL_DATA_REF: 'readonly',
    libCachedCode: 'readonly',
    html2canvas: 'readonly',
  },
  rules: {
    curly: 2,
    'dot-notation': 2,
    eqeqeq: 2,
    'logical-assignment-operators': 2,
    'no-new-func': 2,
    'no-new-object': 2,
    'no-new-wrappers': 2,
    'no-var': 2,
    'no-misleading-character-class': 2,
    'no-template-curly-in-string': 2,
    'no-console': 0,
    'no-unused-vars': 0,
    'no-redeclare': 1,
    'no-unreachable': 1,
    'no-inner-declarations': 0,
    'no-unneeded-ternary': 2,
    'no-else-return': 2,
    'no-extra-bind': 2,
    'no-labels': 2,
    'no-lone-blocks': 2,
    'no-loop-func': 2,
    'no-magic-numbers': 0,
    'no-param-reassign': 2,
    'no-empty': [2, { allowEmptyCatch: true }],
    'no-useless-return': 2,
    'no-use-before-define': 2,
    'object-shorthand': 2,
    'prefer-const': 2,
    'prefer-arrow-callback': 2,
    'prefer-spread': 2,
    'prefer-template': 2,
    'prefer-rest-params': 2,
    'prefer-exponentiation-operator': 2,
    'prefer-destructuring': 2,
    'require-await': 2,
    '@typescript-eslint/ban-ts-comment': 0,
    '@typescript-eslint/naming-convention': [
      2,
      {
        selector: ["interface", "typeAlias"],
        format: ["PascalCase"],
      },
    ],
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/no-unused-vars': [2, { varsIgnorePattern: '^_' }],
    'react/jsx-indent': [2, 2],
    'react/jsx-indent-props': [2, 2],
    'react/jsx-tag-spacing': [2, {
      afterOpening: 'never',
      beforeClosing: 'never',
      beforeSelfClosing: 'always',
    }],
    'react/jsx-max-props-per-line': [2, { maximum: 1, when: 'multiline' }],
    'react/jsx-closing-bracket-location': 2,
    'react/jsx-boolean-value': 2,
    'react/jsx-fragments': 2,
    'react/jsx-no-useless-fragment': 2,
    'react/self-closing-comp': 2,
    'react/no-unused-state': 2,
    'react/no-arrow-function-lifecycle': 2,
    'react/prop-types': 0,
    '@stylistic/arrow-parens': 2,
    '@stylistic/arrow-spacing': [2, { before: true, after: true }],
    '@stylistic/comma-dangle': [1, 'always-multiline'],
    '@stylistic/indent': [2, 2, { SwitchCase: 1 }],
    '@stylistic/linebreak-style': 0,
    '@stylistic/no-floating-decimal': 2,
    '@stylistic/no-multi-spaces': 2,
    '@stylistic/no-trailing-spaces': 2,
    '@stylistic/quote-props': [1, 'as-needed', {
      keywords: true,
      unnecessary: true,
      numbers: false,
    }],
    '@stylistic/semi': [2, 'always'],
    '@stylistic/spaced-comment': 2,
  },
  overrides: [
    {
      files: ['src/gadgets/**/*.vue'],
      parser: "vue-eslint-parser",
      parserOptions: {
        parser: "@typescript-eslint/parser",
      },
      'extends': [
        'eslint:recommended',
        'plugin:vue/vue3-recommended',
      ],
      rules: {
        'vue/multi-word-component-names': 0,
      },
    },

    {
      files: ['src/@types/**/*.d.ts'],
      rules: {
        '@stylistic/quote-props': 0,
        '@typescript-eslint/ban-types': 0,
      },
    },
    {
      files: ['src/oddments/**/*.js'],
      env: {
        browser: true,
        node: false,
        jquery: true,
        es6: true,
      },
      parserOptions: {
        ecmaVersion: 5,
        sourceType: 'script',
      },
      rules: {
        'prefer-arrow-callback': 0,
        'no-var': 0,
        'prefer-template': 0,
      },
    },

    // 打包配置
    {
      files: [
        'build/**/*.js',
        './*.*',
      ],
      env: {
        browser: false,
        node: true,
      },
      parserOptions: {
        ecmaVersion: 'latest',
      },
      rules: {
        '@typescript-eslint/no-var-requires': 0,
      },
    },

    // CI脚本
    {
      files: ['scripts/**/*.js'],
      env: {
        browser: false,
        node: true,
      },
    },
  ],
};
