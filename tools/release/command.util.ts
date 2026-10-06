import { execFileSync } from 'node:child_process';

export const runCommand = (command: string, args: string[]) =>
  execFileSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim();

export const runGit = (...args: string[]) => runCommand('git', args);
