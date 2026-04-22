import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PostContent } from "./_components/PostContent";
import type { Post } from "@/lib/blog-api";

const BASE_URL = "https://staxis.zionstand.com";

async function fetchPost(slug: string): Promise<Post | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/blog/${slug}`,
      { next: { revalidate: 60, tags: [`post-${slug}`] } },
    );
    if (!res.ok) return null;
    return res.json() as Promise<Post>;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPost(slug);

  if (!post) {
    return { title: "Article Not Found" };
  }

  const title = post.title;
  const description = post.excerpt ?? undefined;
  const ogImageUrl = post.coverImage ?? `${BASE_URL}/assets/images/og-image.png`;
  const images = [
    {
      url: ogImageUrl,
      secureUrl: ogImageUrl,
      width: 1200,
      height: 630,
      alt: post.title,
      type: "image/jpeg",
    },
  ];

  return {
    title,
    description,
    keywords: post.tags.length ? post.tags : undefined,
    authors: [
      { name: `${post.author.firstName} ${post.author.lastName}` },
    ],
    openGraph: {
      type: "article",
      url: `${BASE_URL}/blog/${post.slug}`,
      title,
      description,
      images,
      publishedTime: post.publishedAt ?? undefined,
      authors: [`${post.author.firstName} ${post.author.lastName}`],
      siteName: "Zionstand Digital Technologies",
      locale: "en_NG",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: `${BASE_URL}/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await fetchPost(slug);

  if (!post) notFound();

  return <PostContent post={post} />;
}
