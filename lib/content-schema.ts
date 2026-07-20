import { z } from "zod";
import { findCategoryByName } from "@/lib/category-data";

const dateString = z.preprocess(
  (value) => {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return value.toISOString().slice(0, 10);
    }
    return typeof value === "string" ? value.trim() : value;
  },
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "must use YYYY-MM-DD")
    .refine((value) => {
      const parsed = new Date(`${value}T00:00:00.000Z`);
      return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
    }, "must be a valid calendar date"),
);

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().min(1).optional(),
);

export const postFrontmatterSchema = z
  .object({
    title: z.string().trim().min(1, "is required"),
    date: dateString,
    summary: z.string().trim().min(1, "is required"),
    excerpt: optionalText,
    category: optionalText,
    updated: dateString.optional(),
    tags: z.array(z.string().trim().min(1)).default([]),
    series: optionalText,
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.category && !findCategoryByName(data.category)) {
      ctx.addIssue({
        code: "custom",
        path: ["category"],
        message: `unknown category "${data.category}"`,
      });
    }
    if (data.updated && data.updated < data.date) {
      ctx.addIssue({
        code: "custom",
        path: ["updated"],
        message: "must not be earlier than date",
      });
    }
  });

export type PostFrontmatter = z.infer<typeof postFrontmatterSchema>;

export function parsePostFrontmatter(
  filename: string,
  value: unknown,
): PostFrontmatter {
  const result = postFrontmatterSchema.safeParse(value);
  if (result.success) return result.data;

  const details = result.error.issues
    .map((issue) => `${issue.path.join(".") || "frontmatter"}: ${issue.message}`)
    .join("; ");
  throw new Error(`Invalid frontmatter in ${filename}: ${details}`);
}
