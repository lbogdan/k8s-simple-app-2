import { readFile } from 'fs/promises';

export const config: Record<string, string> = {
  environment: 'development',
};

try {
  const newConfig: Record<string, string> = JSON.parse(
    await readFile('config/config.json', { encoding: 'utf8' })
  );
  for (const key of Object.keys(newConfig)) {
    const value = newConfig[key];
    if (value) {
      config[key] = value;
    }
  }
} catch (err) {
  // ignore
}
