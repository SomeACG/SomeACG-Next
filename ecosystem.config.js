module.exports = {
  apps: [
    {
      name: 'SomeACG-Next',
      script: 'npm',
      args: 'run restart',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
