import { z } from 'zod';
import type { Heading } from 'mdast';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期必须为 YYYY-MM-DD');
const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug 必须为小写 kebab-case');
const requiredResearchHeadings = [
  '研究结论',
  '用户与问题',
  '证据',
  '竞品与替代方案',
  '市场与付费',
  'MVP',
  '验证计划',
  '风险与 Kill Criteria'
];

function missingResearchHeadings(markdown: string): string[] {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);
  const headings = new Set(tree.children
    .filter((node): node is Heading => node.type === 'heading' && node.depth === 2)
    .map((node) => node.children.map((child) => (child.type === 'text' || child.type === 'inlineCode' ? child.value : '')).join('')));

  return requiredResearchHeadings.filter((heading) => !headings.has(heading));
}

function hasResearchMetadataComment(markdown: string): boolean {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);
  const visit = (node: { type: string; value?: string; children?: unknown[] }): boolean =>
    (node.type === 'html' && node.value?.includes('<!-- opportunity-radar:research') === true) ||
    node.children?.some((child) => visit(child as { type: string; value?: string; children?: unknown[] })) === true;

  return visit(tree);
}

const researchMetadataSchema = z
  .object({
    version: z.literal(1),
    opportunityId: z.string().min(1),
    originReport: dateSchema,
    originSlug: slugSchema,
    status: z.literal('research-complete'),
    siteSummary: z.string().trim().min(1)
  })
  .refine((metadata) => metadata.opportunityId === createOpportunityId(metadata.originReport, metadata.originSlug), {
    message: 'opportunityId 必须与 originReport 和 originSlug 匹配',
    path: ['opportunityId']
  });

export type ResearchMetadata = z.infer<typeof researchMetadataSchema>;

export interface GitHubIssueInput {
  number: number;
  html_url: string;
  title: string;
  updated_at: string;
  body: string | null;
}

const researchIssueSchema = z
  .object({
    issueNumber: z.number().int().positive(),
    issueUrl: z.url(),
    title: z.string().trim().min(1),
    updatedAt: z.iso.datetime(),
    metadata: researchMetadataSchema,
    markdown: z.string().trim().min(1)
  })
  .superRefine((research, context) => {
    const missingHeadings = missingResearchHeadings(research.markdown);
    if (missingHeadings.length) {
      context.addIssue({ code: 'custom', message: `完整报告缺少必填章节：${missingHeadings.join('、')}`, path: ['markdown'] });
    }
  });

const researchIndexSchema = z
  .object({
    version: z.literal(1),
    generatedAt: z.iso.datetime(),
    research: z.array(researchIssueSchema)
  })
  .superRefine((index, context) => {
    const opportunityIds = new Set<string>();
    index.research.forEach((research, position) => {
      if (opportunityIds.has(research.metadata.opportunityId)) {
        context.addIssue({ code: 'custom', message: '研究索引中的 opportunityId 必须唯一', path: ['research', position, 'metadata', 'opportunityId'] });
      }
      opportunityIds.add(research.metadata.opportunityId);
    });
  });

export type ResearchIssue = z.infer<typeof researchIssueSchema>;
export type ResearchIndex = z.infer<typeof researchIndexSchema>;

const researchMarker = /^\s*<!-- opportunity-radar:research ([^\r\n]+?) -->[ \t]*(?:\r?\n)?/;

export function createOpportunityId(originReport: string, originSlug: string): string {
  return `${originReport}--${originSlug}`;
}

export function parseResearchIndex(value: unknown): ResearchIndex {
  return researchIndexSchema.parse(value);
}

function assertRequiredResearchSections(markdown: string, issueNumber: number): void {
  const missingHeadings = missingResearchHeadings(markdown);
  if (missingHeadings.length) throw new Error(`Issue #${issueNumber} 的完整报告缺少必填章节：${missingHeadings.join('、')}`);
}

export function parseResearchIssue(issue: GitHubIssueInput): ResearchIssue | null {
  const body = issue.body ?? '';
  const match = body.match(researchMarker);

  if (!match) {
    if (hasResearchMetadataComment(body)) {
      throw new Error(`Issue #${issue.number} 的 Opportunity Radar 元数据必须是第一个非空块中的单行紧凑 JSON 注释`);
    }
    return null;
  }

  let rawMetadata: unknown;
  try {
    rawMetadata = JSON.parse(match[1]);
  } catch {
    throw new Error(`Issue #${issue.number} 的 Opportunity Radar 元数据不是有效 JSON`);
  }
  if (JSON.stringify(rawMetadata) !== match[1]) {
    throw new Error(`Issue #${issue.number} 的 Opportunity Radar 元数据必须使用紧凑 JSON`);
  }

  const metadata = researchMetadataSchema.parse(rawMetadata);
  const markdown = body.slice(match[0].length).trim();

  if (!markdown) throw new Error(`Issue #${issue.number} 的研究报告不能为空`);
  assertRequiredResearchSections(markdown, issue.number);

  return {
    issueNumber: issue.number,
    issueUrl: issue.html_url,
    title: issue.title,
    updatedAt: issue.updated_at,
    metadata,
    markdown
  };
}
