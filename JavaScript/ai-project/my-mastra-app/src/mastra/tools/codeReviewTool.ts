import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import fs from 'fs';
import { glob } from 'glob';

export interface CodeReviewResult {
  filePath: string;
  metrics: {
    complexity: number;
    maintainability: number;
  };
  issues: Array<{
    type: 'error' | 'warning' | 'suggestion';
    line: number;
    message: string;
    code?: string;
  }>;
}

const CodeReviewConfigSchema = z.object({
  includePatterns: z.array(z.string()).default(['src/**/*.ts']),
  excludePatterns: z.array(z.string()).default(['node_modules/**', 'dist/**']),
  maxComplexity: z.number().default(10),
  requireTests: z.boolean().default(true),
});

export const codeReviewTool = createTool({
  id: 'code-review',
  description: 'Review code quality, style, and potential issues',
  inputSchema: CodeReviewConfigSchema,
  outputSchema: z.array(z.object({
    filePath: z.string(),
    metrics: z.object({
      complexity: z.number(),
      maintainability: z.number(),
    }),
    issues: z.array(z.object({
      type: z.enum(['error', 'warning', 'suggestion']),
      line: z.number(),
      message: z.string(),
      code: z.string().optional(),
    })),
  })),
  execute: async ({ context }) => {
    const results: CodeReviewResult[] = [];
    const config = context;
    
    // 获取所有需要审查的文件
    const files = await findFiles(config.includePatterns, config.excludePatterns);
    
    // 审查每个文件
    for (const file of files) {
      const result = await reviewFile(file, config);
      results.push(result);
    }
    
    return results;
  },
});

async function findFiles(includePatterns: string[], excludePatterns: string[]): Promise<string[]> {
  const files = new Set<string>();
  
  for (const pattern of includePatterns) {
    const matches = await glob(pattern, { ignore: excludePatterns });
    matches.forEach((file: string) => files.add(file));
  }
  
  return Array.from(files);
}

async function reviewFile(filePath: string, config: z.infer<typeof CodeReviewConfigSchema>): Promise<CodeReviewResult> {
  const content = await fs.promises.readFile(filePath, 'utf-8');
  const lines = content.split('\n');
  
  const complexity = calculateComplexity(lines);
  const maintainability = calculateMaintainability(lines, complexity);
  const issues = findIssues(lines, config, filePath, complexity);
  
  return {
    filePath,
    metrics: {
      complexity,
      maintainability,
    },
    issues,
  };
}

function calculateComplexity(lines: string[]): number {
  let complexity = 1;
  
  for (const line of lines) {
    if (line.includes('if') || line.includes('for') || line.includes('while') || line.includes('switch')) {
      complexity++;
    }
  }
  
  return complexity;
}

function calculateMaintainability(lines: string[], complexity: number): number {
  const totalLines = lines.length;
  const commentLines = lines.filter(line => line.trim().startsWith('//') || line.trim().startsWith('/*')).length;
  const codeLines = totalLines - commentLines;
  
  return Math.max(0, 100 - (codeLines * 0.5) - (complexity * 2));
}

function findIssues(
  lines: string[],
  config: z.infer<typeof CodeReviewConfigSchema>,
  filePath: string,
  complexity: number
): CodeReviewResult['issues'] {
  const issues: CodeReviewResult['issues'] = [];
  
  // 检查行长度
  lines.forEach((line, index) => {
    if (line.length > 100) {
      issues.push({
        type: 'warning',
        line: index + 1,
        message: 'Line is too long',
        code: line,
      });
    }
  });
  
  // 检查复杂度
  if (complexity > config.maxComplexity) {
    issues.push({
      type: 'error',
      line: 1,
      message: `File complexity (${complexity}) exceeds maximum allowed (${config.maxComplexity})`,
    });
  }
  
  // 检查测试文件
  if (config.requireTests) {
    const testFile = filePath.replace(/\.(ts|tsx)$/, '.test.$1');
    if (!fs.existsSync(testFile)) {
      issues.push({
        type: 'warning',
        line: 1,
        message: 'No test file found',
      });
    }
  }
  
  return issues;
} 