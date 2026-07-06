import { createServer } from '../dist/index';

const { app } = createServer({
  projectPath: process.env.PROJECT_PATH || process.cwd(),
});

export default app;
