module.exports = {
    "env": {
        "browser": true,
        "es2020": true
    },

    // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended"
    ],

    "parser": "@typescript-eslint/parser",  // Specifies the ESLint parser
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": 2020,
        "sourceType": "module"  // Allows for the use of imports
    },

    "plugins": [
        "@typescript-eslint",
        "import",
        "node",
        "promise",
        "async-await",
        "json"
    ],

    "globals": {
        "document": "readonly",
        "navigator": "readonly",
        "window": "readonly"
     },

    "rules": {
      // Place to specify ESLint rules. Can be used to overwrite 
      // rules specified from the extended configs
      // e.g. "@typescript-eslint/explicit-function-return-type": "off",
      "no-var": "warn",            // warn if var is used
      "semi": ["error", "always"]  // error for missing semi-colon
    }
};
