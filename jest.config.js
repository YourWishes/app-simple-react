module.exports = {
  "roots": [
    "<rootDir>/src/private"
  ],
  "transform": {
    "^.+\\.tsx?$": "ts-jest"
  },
  "globals": {
    'ts-jest': {
      compiler: 'ttypescript'
    }
  },
  "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
  "moduleFileExtensions": [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json"
  ]
}
