# my-mastra-app

## 项目简介

my-mastra-app 是一个基于 Mastra 框架开发的智能代码审查工具，旨在帮助开发者自动检测代码中的质量问题、风格规范和潜在风险，提高代码的可维护性和可靠性。

## 功能介绍

- 自动化代码质量检查
- 代码风格一致性检测
- 潜在问题和风险提示
- 支持多种自定义配置
- 适用于 TypeScript/JavaScript 项目

## 安装方法

```bash
pnpm add @mastra/core glob @types/glob
```

## 使用方法

1. 引入代码审查工具：

```typescript
import { CodeReviewTool } from './tools/codeReview';

const codeReviewTool = new CodeReviewTool();
```

2. 配置审查参数：

```typescript
const config = {
  includePatterns: ['src/**/*.ts'], // 需要审查的文件模式
  excludePatterns: ['node_modules/**', 'dist/**'], // 排除的文件模式
  maxComplexity: 10, // 最大圈复杂度
  requireTests: true, // 是否要求有测试
};
```

3. 执行审查并获取结果：

```typescript
const results = await codeReviewTool.execute({
  data: config,
  context: {},
  runtimeContext: {},
});

for (const result of results) {
  console.log(`文件: ${result.filePath}`);
  console.log('度量:', result.metrics);
  console.log('问题:', result.issues);
}
```

---

如需更多帮助或有任何建议，欢迎提交 Issue 或 Pull Request！ 