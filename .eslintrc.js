module.exports = {
  env: {
    node: true,
    browser: true,
    jquery: true,
    es6: true,
    es2020: true,
    es2021: true,
    es2022: true
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended"
  ],
  globals: {
    mw: "readonly",
    mediaWiki: "readonly",
    OO: "readonly",
    localforage: "readonly",
    moment: "readonly",
    LocalObjectStorage: "readonly",
    insertToBottomRightCorner: "readonly",
    wgULS: "readonly",
    wgUVS: "readonly",
    hashwasm: "readonly",
    oouiDialog: "readonly",
    echarts: "readonly",
    AsyncLock: "readonly",
    MOE_SKIN_GLOBAL_DATA_REF: "readonly",
    libCachedCode: "readonly",
    html2canvas: "readonly",
    saveAs: "readonly"
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  plugins: [
    "react"
  ],
  rules: {
    "logical-assignment-operators": "error",
    "no-new-func": "error",
    "no-new-object": "error",
    "no-new-wrappers": "error",
    "no-var": "error",
    "prefer-const": "error",
    "no-misleading-character-class": "error",
    "no-template-curly-in-string": "error",
    "require-atomic-updates": "error",
    "curly": "error",
    "indent": [
      "error",
      4,
      {
        "SwitchCase": 1
      }
    ],
    "linebreak-style": [
      "off",
      "windows"
    ],
    "semi": [
      "error",
      "always"
    ],
    "no-console": "off",
    "no-unused-vars": [
      "warn",
      {
        "varsIgnorePattern": "^_"
      }
    ],
    "no-redeclare": "warn",
    "no-unreachable": "warn",
    "no-inner-declarations": "off",
    "no-unneeded-ternary": "error",
    "comma-dangle": [
      "warn",
      "always-multiline"
    ],
    "eqeqeq": "error",
    "dot-notation": "error",
    "no-else-return": "error",
    "no-extra-bind": "error",
    "no-labels": "error",
    "no-floating-decimal": "error",
    "no-lone-blocks": "error",
    "no-loop-func": "error",
    "no-magic-numbers": "off",
    "no-multi-spaces": "error",
    "no-param-reassign": "error",
    "quote-props": [
      "warn",
      "as-needed",
      {
        "keywords": true,
        "unnecessary": true,
        "numbers": false
      }
    ],
    "no-empty": [
      "error",
      {
        "allowEmptyCatch": true
      }
    ],
    "arrow-spacing": [
      "error",
      {
        "before": true,
        "after": true
      }
    ],
    "prefer-arrow-callback": "error",
    "prefer-spread": "error",
    "prefer-template": "error",
    "prefer-rest-params": "error",
    "prefer-exponentiation-operator": "error",
    "require-await": "error",
    "arrow-parens": "error",
    "no-use-before-define": "error",
    "react/self-closing-comp": "error"
  },
  overrides: [
    {
      files: [
        "src/oddments/**/*.js"
      ],
      rules: {
        "prefer-arrow-callback": "off"
      }
    },

    // 打包配置
    {
      files: [
        "build/**/*.js"
      ],
      env: {
        node: true
      },
      parserOptions: {
        ecmaVersion: "latest"
      },
      rules: {
        "indent": [
          "error",
          2
        ]
      }
    },

    // CI脚本
    {
      files: [
        "scripts/**/*.js"
      ],
      env: {
        browser: false,
        node: true
      }
    }
  ]
}