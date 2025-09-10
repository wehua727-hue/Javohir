import { spawn } from 'child_process';

// Run vercel deploy command
const deploy = spawn('npx', ['vercel', 'deploy', '--prod', '--yes'], {
  stdio: 'inherit',
  shell: true
});

deploy.on('close', (code) => {
  console.log(`Deployment process exited with code ${code}`);
});