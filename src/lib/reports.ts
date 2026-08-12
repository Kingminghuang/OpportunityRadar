import { z } from 'zod';

const decisionSchema = z.enum(['deep-dive', 'watch', 'skip']);
const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug 必须为小写 kebab-case');
const sourceTypeSchema = z.enum(['github-issue', 'hacker-news', 'reddit', 'product-hunt', 'indie-hackers', 'other']);

function isValidCalendarDate(value: string): boolean {
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, '日期必须为 YYYY-MM-DD')
  .refine(isValidCalendarDate, '日期必须是有效的日历日期');

const scoreSchema = z
  .object({
    total: z.number().int().min(0).max(25),
    demand: z.number().int().min(0).max(5),
    payment: z.number().int().min(0).max(5),
    mvp: z.number().int().min(0).max(5),
    competition: z.number().int().min(0).max(5),
    acquisition: z.number().int().min(0).max(5)
  })
  .refine(
    (score) => score.total === score.demand + score.payment + score.mvp + score.competition + score.acquisition,
    { message: '总分必须等于五项子评分之和', path: ['total'] }
  );

const evidenceSchema = z.object({
  title: z.string().trim().min(1),
  url: z.url(),
  sourceType: sourceTypeSchema,
  publishedAt: dateSchema.optional(),
  summary: z.string().trim().min(1)
});

const opportunitySchema = z.object({
  rank: z.number().int().min(1).max(5),
  slug: slugSchema,
  title: z.string().trim().min(1),
  category: slugSchema,
  decision: decisionSchema,
  score: scoreSchema,
  opportunity: z.string().trim().min(1),
  whyNow: z.string().trim().min(1),
  evidence: z.array(evidenceSchema).min(2).max(4),
  verdict: z.string().trim().min(1),
  tags: z.array(z.string().trim().min(1)).min(1)
});

const prioritySchema = z.object({
  slug: slugSchema,
  reason: z.string().trim().min(1)
});

const reportSchema = z
  .object({
    schemaVersion: z.literal(1),
    date: dateSchema,
    timezone: z.literal('Asia/Singapore'),
    title: z.string().trim().min(1),
    summary: z.string().trim().min(1),
    categories: z.array(z.string()).min(1).refine((categories) => categories.includes('opportunities'), {
      message: 'categories 必须包含 opportunities'
    }),
    opportunities: z.array(opportunitySchema).min(1).max(5),
    priorities: z.object({
      deepDive: prioritySchema,
      fastestMvp: prioritySchema,
      highestCommercialValue: prioritySchema,
      needsValidation: prioritySchema
    }),
    scanNotes: z.object({
      coverageWindow: z.string().trim().min(1),
      sources: z.array(z.string().trim().min(1)).min(1),
      limitations: z.string().trim().min(1)
    })
  })
  .superRefine((report, context) => {
    const slugs = new Set<string>();
    const ranks = new Set<number>();

    report.opportunities.forEach((opportunity, index) => {
      if (slugs.has(opportunity.slug)) {
        context.addIssue({ code: 'custom', message: '同一日报内的 slug 必须唯一', path: ['opportunities', index, 'slug'] });
      }
      if (ranks.has(opportunity.rank)) {
        context.addIssue({ code: 'custom', message: '同一日报内的 rank 必须唯一', path: ['opportunities', index, 'rank'] });
      }
      slugs.add(opportunity.slug);
      ranks.add(opportunity.rank);
    });

    for (const [name, priority] of Object.entries(report.priorities)) {
      if (!slugs.has(priority.slug)) {
        context.addIssue({ code: 'custom', message: `优先级 ${name} 必须引用日报中存在的机会 slug`, path: ['priorities', name, 'slug'] });
      }
    }
  });

export type OpportunityRecord = z.infer<typeof opportunitySchema>;
export type Decision = z.infer<typeof decisionSchema>;
export type Report = z.infer<typeof reportSchema> & { path: string; slug: string };
export type RawReport = { path: string; data: unknown };

export function contentAnchor(slug: string): string {
  return `opportunity-${slug}`;
}

export function decisionLabel(decision: Decision): string {
  return { 'deep-dive': '深挖', watch: '观察', skip: '跳过' }[decision];
}

export function reportSlug(date: string): string {
  return date;
}

export function sitePath(base: string, path: string): string {
  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

export function reportHref(base: string, reportSlugValue: string, opportunitySlug?: string): string {
  const reportPath = sitePath(base, `reports/${reportSlugValue}/`);
  return opportunitySlug ? `${reportPath}#${contentAnchor(opportunitySlug)}` : reportPath;
}

export function parseReports(rawReports: RawReport[]): Report[] {
  return rawReports
    .map(({ path, data }) => {
      const parsed = reportSchema.parse(data);
      const filenameDate = path.match(/_data\/reports\/(\d{4}-\d{2}-\d{2})\.json$/)?.[1];

      if (filenameDate !== parsed.date) {
        throw new Error(`报告文件名日期必须与 JSON date 一致：${path}`);
      }

      return { ...parsed, path, slug: reportSlug(parsed.date) };
    })
    .sort((left, right) => right.date.localeCompare(left.date));
}
