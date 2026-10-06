import type { Config } from 'stylelint';

export default {
  extends: [
    // standard本身继承recommended，无需重复声明
    "stylelint-config-standard",
  ],
  ignoreFiles: [
    "dist/**/*",
    "node_modules/**/*",
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
