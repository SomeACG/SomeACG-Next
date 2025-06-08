module.exports = {
  apps: [
    {
      name: 'SomeACG-Next',
      script: 'pnpm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
