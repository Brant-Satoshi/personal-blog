import { getPostBySlug } from "@/lib/posts";
import {
  createSocialImage,
  SOCIAL_IMAGE_CONTENT_TYPE,
  SOCIAL_IMAGE_SIZE,
} from "@/lib/social-image";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const alt = `Article on ${SITE_NAME}`;
export const size = SOCIAL_IMAGE_SIZE;
export const contentType = SOCIAL_IMAGE_CONTENT_TYPE;

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  return createSocialImage({
    title: post?.title ?? SITE_NAME,
    description: post?.summary ?? SITE_DESCRIPTION,
    eyebrow: post?.category ?? "Article",
  });
}
