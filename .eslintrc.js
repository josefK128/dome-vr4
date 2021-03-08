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
      "@typescript-eslint/no-unused-vars": "off",
      "no-var": "warn",              // warn if var is used
      "semi": ["error", "always"],  // error for missing semi-colon

      "no-unreachable": "warn",    // disallow unreachable code
      "no-dupe-keys": "warn",     // disallow duplicate properties in container
      "no-duplicate-case": "warn",    // disallow duplicate cases in switch
      "default-case": "warn",   // require default case in switch
      "eqeqeq": "warn",        // require === and !== (not == and !=)
      "wrap-iife": "warn",    // require (()=>{})() not ()=>{}()
      "no-tabs": "warn",    // enforce spaces for tabs
      "no-multi-assign": "warn",    // no a=b=c
      "no-cond-assign":0  // allow assign in conditional - check for undefined
    }
};
