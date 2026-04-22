import api, { uploadFile } from "./api"

// ── Types ──────────────────────────────────────────────────────────────────────

export type PostStatus = "PUBLISHED" | "DRAFT"
export type PostCategory =
  | "NEWS"
  | "BLOG"
  | "LIFESTYLE"
  | "GUIDES"
  | "EVENTS"
  | "OTHER"

export interface PostAuthor {
  firstName: string | null
  lastName: string | null
}

export interface PostSummary {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImage: string | null
  category: PostCategory
  tags: string[]
  publishedAt: string | null
  author: PostAuthor
}

export interface Post extends PostSummary {
  body: string
  status: PostStatus
  createdAt: string
  updatedAt: string
}

export interface PostsResponse {
  total: number
  page: number
  limit: number
  data: PostSummary[]
}

export interface AdminPostsResponse {
  total: number
  page: number
  limit: number
  data: Post[]
}

export interface CreatePostInput {
  title: string
  body: string
  excerpt?: string
  coverImage?: string
  category?: PostCategory
  tags?: string[]
}

export interface UpdatePostInput {
  title?: string
  body?: string
  excerpt?: string
  coverImage?: string
  category?: PostCategory
  tags?: string[]
}

// ── Constants ──────────────────────────────────────────────────────────────────

export const POST_CATEGORIES: { value: PostCategory; label: string }[] = [
  { value: "NEWS", label: "News" },
  { value: "BLOG", label: "Blog" },
  { value: "LIFESTYLE", label: "Lifestyle" },
  { value: "GUIDES", label: "Guides" },
  { value: "EVENTS", label: "Events" },
  { value: "OTHER", label: "Other" },
]

// ── Public API ─────────────────────────────────────────────────────────────────

export async function getPublishedPosts(options?: {
  page?: number
  limit?: number
  category?: string
  search?: string
}): Promise<PostsResponse> {
  const params = new URLSearchParams()
  if (options?.page) params.set("page", String(options.page))
  if (options?.limit) params.set("limit", String(options.limit))
  if (options?.category) params.set("category", options.category)
  if (options?.search) params.set("search", options.search)
  const res = await api.get(`/blog?${params.toString()}`)
  return res.data
}

// ── Admin API ──────────────────────────────────────────────────────────────────

export async function getAdminPosts(options?: {
  page?: number
  limit?: number
  status?: PostStatus
  search?: string
}): Promise<AdminPostsResponse> {
  const params = new URLSearchParams()
  if (options?.page) params.set("page", String(options.page))
  if (options?.limit) params.set("limit", String(options.limit))
  if (options?.status) params.set("status", options.status)
  if (options?.search) params.set("search", options.search)
  const res = await api.get(`/a/blog?${params.toString()}`)
  return res.data
}

export async function getAdminPostById(id: string): Promise<Post> {
  const res = await api.get(`/a/blog/${id}`)
  return res.data
}

export async function createPost(dto: CreatePostInput): Promise<Post> {
  const res = await api.post("/a/blog", dto)
  return res.data
}

export async function updatePost(
  id: string,
  dto: UpdatePostInput,
): Promise<Post> {
  const res = await api.patch(`/a/blog/${id}`, dto)
  return res.data
}

export async function publishPost(id: string): Promise<Post> {
  const res = await api.patch(`/a/blog/${id}/publish`)
  return res.data
}

export async function unpublishPost(id: string): Promise<Post> {
  const res = await api.patch(`/a/blog/${id}/unpublish`)
  return res.data
}

export async function deletePost(id: string): Promise<void> {
  await api.delete(`/a/blog/${id}`)
}

export async function uploadPostCover(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)
  const res = await uploadFile<{ url: string }>("/upload/blog-cover", formData)
  return res.url
}
