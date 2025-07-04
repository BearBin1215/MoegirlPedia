import { globalIgnores } from 'eslint/config';
import globals from 'globals';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import reactPlugin from 'eslint-plugin-react';
import vuePlugin from 'eslint-plugin-vue';
import * as espree from 'espree';

export default tseslint.config(
  globalIgnores([
    '**/node_modules/', // 依赖文件
    '**/dist/', // 输出文件
    '**/lib/', // oojs-ui-react的输出文件等
  ]),

  // #region 配置导入
  eslint.configs.recommended,
  importPlugin.flatConfigs.recommended,
  tseslint.configs.recommended,
  ...vuePlugin.configs['flat/recommended'],
  // #endregion

  // #region 通用配置
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        requireConfigFile: false,
        project: './tsconfig.json',
        extraFileExtensions: ['.vue'],
      },
    },
    plugins: {
      '@stylistic': stylistic,
      'react': reactPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'curly': 2, // if等语句不可省略花括号
      'dot-notation': 2, // 使用点符号访问属性
      'eqeqeq': 2, // 强制使用 === 而非 ==
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
      'no-empty': [2, {
        allowEmptyCatch: true,
      }],
      'no-extra-bind': 2,
      'no-labels': 2,
      'no-lone-blocks': 2,
      'no-loop-func': 2,
      'no-magic-numbers': 0,
      'no-param-reassign': 2,
      'no-shadow': 2,
      'no-unused-expressions': 2,
      'no-useless-rename': 2,
      'no-useless-return': 2,
      'no-use-before-define': 2,
      'object-shorthand': 2,
      'one-var': [2, 'never'],
      'prefer-const': 2,
      'prefer-arrow-callback': 2,
      'prefer-spread': 2,
      'prefer-template': 2,
      'prefer-rest-params': 2,
      'prefer-exponentiation-operator': 2,
      'prefer-destructuring': 2,
      'require-await': 2,
      'yoda': 2,
      'import/no-named-as-default': 0,
      'import/no-unresolved': 0,
      'import/order': 1,
      '@typescript-eslint/ban-ts-comment': 0,
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/no-unused-vars': [2, {
        varsIgnorePattern: '^_',
      }],
      'react/jsx-curly-brace-presence': 2,
      'react/jsx-indent': [2, 2],
      'react/jsx-indent-props': [2, 2],
      'react/jsx-tag-spacing': [2, {
        afterOpening: 'never',
        beforeClosing: 'never',
        beforeSelfClosing: 'always',
      }],
      'react/jsx-max-props-per-line': [2, {
        maximum: 1,
        when: 'multiline',
      }],
      'react/jsx-closing-bracket-location': 2,
      'react/jsx-boolean-value': 2,
      'react/jsx-fragments': 2,
      'react/jsx-no-target-blank': 0,
      'react/jsx-no-useless-fragment': 2,
      'react/self-closing-comp': 2,
      'react/no-unused-state': 2,
      'react/no-arrow-function-lifecycle': 2,
      'react/prop-types': 0,
      '@stylistic/arrow-parens': 2,
      '@stylistic/arrow-spacing': [2, {
        before: true,
        after: true,
      }],
      '@stylistic/comma-dangle': [1, 'always-multiline'],
      '@stylistic/indent': [2, 2, {
        SwitchCase: 1,
      }],
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
  },
  // #endregion

  // #region 通用全局配置
  {
    files: ['src/**/*'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jquery,
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
        Vue: 'readonly',
      },
    },
  },
  // #endregion

  // #region Vue配置
  {
    files: ['src/gadgets/**/*.vue'],
    rules: {
      'vue/html-quotes': 0, // 不要求双引号
    },
  },
  // #endregion

  // #region 小代码配置
  {
    files: ['src/oddments/**/*.js'],
    languageOptions: {
      parser: espree,
      ecmaVersion: 5,
      sourceType: 'script',
    },
    rules: {
      'prefer-arrow-callback': 0,
      'no-var': 0,
      'prefer-template': 0,
    },
  },
  // #endregion

  // #region 脚本文件配置
  {
    files: ['scripts/**/*.js', 'scripts/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  // #endregion

  // #region 根目录下配置文件
  {
    files: ['./*.js', './*.mjs', './*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      '@stylistic/quote-props': 0, // 不要求key是否带引号
    },
  },
  // #endregion
);
