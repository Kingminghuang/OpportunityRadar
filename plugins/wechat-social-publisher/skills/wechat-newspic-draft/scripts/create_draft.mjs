#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// The workspace plugin reuses the tested project adapter so report/API behavior
// remains single-sourced while this plugin is developed in OpportunityRadar.
const projectScript = fileURLToPath(new URL('../../../../../skills/wechat-newspic-draft/scripts/create_draft.mjs', import.meta.url));
const child = spawn(process.execPath, [projectScript, ...process.argv.slice(2)], { stdio: 'inherit' });
child.once('error', (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
child.once('close', (code, signal) => {
  if (signal) process.exitCode = 1;
  else process.exitCode = code ?? 1;
});
