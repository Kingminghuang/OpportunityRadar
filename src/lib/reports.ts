import { z } from 'zod';

const decisionSchema = z.enum(['深挖', '观察', '跳过']);
const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug 必须为小写 kebab-case');
const dateSchema = z.preprocess(
  (value) => {
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) return value.slice(0, 10);
    return value;
  },
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期必须为 YYYY-MM-DD')
);

const opportunitySchema = z
  .object({
    slug: slugSchema,
    title: z.string().trim().min(1),
    score: z.number().int().min(0).max(25),
    demand: z.number().int().min(0).max(5),
    payment: z.number().int().min(0).max(5),
    mvp: z.number().int().min(0).max(5),
    competition: z.number().int().min(0).max(5),
    acquisition: z.number().int().min(0).max(5),
    category: slugSchema,
    decision: decisionSchema
  })
  .refine(
    (opportunity) =>
      opportunity.score ===
      opportunity.demand +
        opportunity.payment +
        opportunity.mvp +
        opportunity.competition +
        opportunity.acquisition,
    { message: '总分必须等于五项子评分之和', path: ['score'] }
  );

const frontmatterSchema = z
  .object({
    layout: z.literal('post'),
    title: z.string().trim().min(1),
    date: dateSchema,
    summary: z.string().trim().min(1),
    categories: z.array(z.string()).min(1).refine((categories) => categories.includes('opportunities'), {
      message: 'categories 必须包含 opportunities'
    }),
    opportunities: z.array(opportunitySchema).min(1).max(5)
  })
  .superRefine((report, context) => {
    const slugs = new Set<string>();

    report.opportunities.forEach((opportunity, index) => {
      if (slugs.has(opportunity.slug)) {
        context.addIssue({
          code: 'custom',
          message: '同一日报内的 slug 必须唯一',
          path: ['opportunities', index, 'slug']
        });
      }

      slugs.add(opportunity.slug);
    });
  });

export type OpportunityRecord = z.infer<typeof opportunitySchema>;

export type Report = z.infer<typeof frontmatterSchema> & {
  path: string;
  slug: string;
};

export type RawReport = {
  path: string;
  frontmatter: unknown;
};

export function contentAnchor(slug: string): string {
  return `opportunity-${slug}`;
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
    .map(({ path, frontmatter }) => {
      const parsed = frontmatterSchema.parse(frontmatter);
      const filenameDate = path.match(/_posts\/(\d{4}-\d{2}-\d{2})-daily-opportunities\.md$/)?.[1];

      if (filenameDate !== parsed.date) {
        throw new Error(`报告文件名日期必须与 front matter date 一致：${path}`);
      }

      return { ...parsed, path, slug: reportSlug(parsed.date) };
    })
    .sort((left, right) => right.date.localeCompare(left.date));
}
