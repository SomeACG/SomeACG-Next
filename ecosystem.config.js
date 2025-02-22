module.exports = {
  apps: [
    {
      name: 'SomeACG-Next',
      script: 'pnpm',
      args: 'restart',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
