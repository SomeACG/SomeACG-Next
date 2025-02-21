module.exports = {
  apps: [
    {
      name: 'cos-pic-db-sync',
      script: 'python3',
      args: 'scripts/sync_db.py',
      autorestart: false, // 执行完成后不自动重启
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'cos-pic-next',
      script: 'npm',
      args: 'run restart',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
