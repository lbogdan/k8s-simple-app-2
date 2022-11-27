import { readFile } from 'fs/promises';
import chokidar from 'chokidar';

export const config: Record<string, string> = {
  environment: 'development',
};

async function loadConfig() {
  console.debug('[DEBUG] loading config');
  try {
    const newConfig: Record<string, string> = JSON.parse(
      await readFile('config/config.json', { encoding: 'utf8' })
    );
    for (const key of Object.keys(config)) {
      delete config[key];
    }
    for (const key of Object.keys(newConfig)) {
      const value = newConfig[key];
      if (value) {
        config[key] = value;
      }
    }
  } catch (err) {
    // ignore
  }
}

loadConfig();

chokidar.watch('config/config.json').on('change', loadConfig);
