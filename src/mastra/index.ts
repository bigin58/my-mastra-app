
import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';
import { CloudflareDeployer } from '@mastra/deployer-cloudflare';

import { codeReviewAgent } from './agents/codeReviewAgent';

export const mastra = new Mastra({
  agents: { codeReviewAgent },
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
  deployer: new CloudflareDeployer({
    scope: process.env.CLOUDFLARE_ACCOUNT_ID || "",
    projectName: process.env.CLOUDFLARE_PROJECT_NAME,
    auth: {
      apiToken: process.env.CLOUDFLARE_API_TOKEN || "",
    },
  }),
});
