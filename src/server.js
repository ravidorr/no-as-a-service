import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { NO_RESPONSE } from './no.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const app = express();
const publicPath = resolve(__dirname, '../public');

app.use(express.static(publicPath));

app.all('/api/no', (req, res) => {
  res.status(200).type('text/plain').send(NO_RESPONSE);
});

app.use((req, res) => {
  res.status(200).type('text/plain').send(NO_RESPONSE);
});

if (import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log(`NaaS listening on http://localhost:${port}`);
  });
}
