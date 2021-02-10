const presets = [
  [
    '@babel/env',
    {
      targets: { node: true },
      useBuiltIns: 'usage',
      corejs: { version: 3, proposals: true }
    }
  ]
]

module.exports = { presets }
