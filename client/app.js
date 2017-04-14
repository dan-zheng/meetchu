const args = () => {
  if (process.env.NODE_ENV === 'production') {
    return [ 'run', 'build' ];
  } else {
    return [ 'run', 'dev' ];
  }
};

const opts = { stdio: 'inherit', cwd: 'client', shell: true };
require('child_process').spawn('npm', args(), opts);
