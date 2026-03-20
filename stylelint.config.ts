import stylelintLess from 'stylelint-less';
import postcssLess from 'postcss-less';
import type { Config } from 'stylelint';

export default {
  plugins: [
    stylelintLess,
  ],
  extends: [
    "stylelint-config-standard",
    "stylelint-config-recommended",
    "stylelint-config-recommended-less",
  ],
  ignoreFiles: [
    "dist/**/*",
    "node_modules/**/*",
    "src/components/oojs-ui-react/node_modules/**/*",
  ],
  overrides: [
    {
      files: ["src/**/*.less"],
      customSyntax: postcssLess,
    },
  ],
  rules: {
    "selector-id-pattern": null,
    "selector-class-pattern": null,
    "selector-pseudo-class-no-unknown": [true, { "ignorePseudoClasses": ["global"] }],
    "comment-empty-line-before": null,
    "import-notation": ["string"],
    "no-descending-specificity": null,
    "media-feature-range-notation": null,
  },
} satisfies Config;
