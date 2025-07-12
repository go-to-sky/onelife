import { api } from "../../../trpc/server";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import Image from "next/image";

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function ExhibitPage({ params }: PageProps) {
  try {
    const exhibit = await api.exhibit.getBySlug({ slug: params.slug });

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-gray-700">
              首页
            </Link>
            <span className="mx-2">/</span>
            <span>展品详情</span>
          </nav>

          <div className="flex items-center gap-3 mb-4">
            <span
              className="category-badge"
              style={{
                backgroundColor: exhibit.category.color + "20",
                color: exhibit.category.color,
              }}
            >
              {exhibit.category.name}
            </span>
            {exhibit.emotionScore && (
              <div className="flex items-center text-sm text-gray-600">
                <span className="mr-2">情绪评分:</span>
                <div className="emotion-bar w-20">
                  <div
                    className="emotion-fill"
                    style={{
                      width: `${exhibit.emotionScore * 10}%`,
                      backgroundColor: getEmotionColor(exhibit.emotionScore),
                    }}
                  />
                </div>
                <span className="ml-2">{exhibit.emotionScore}/10</span>
              </div>
            )}
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {exhibit.title}
          </h1>

          {exhibit.description && (
            <p className="text-xl text-gray-600 mb-6">{exhibit.description}</p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
            <div className="flex items-center gap-2">
              {exhibit.user.image && (
                <Image
                  src={exhibit.user.image}
                  alt={exhibit.user.name || "用户"}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              )}
              <span>作者: {exhibit.user.name || "匿名用户"}</span>
            </div>
            <span>
              发布于 {new Date(exhibit.createdAt).toLocaleDateString("zh-CN")}
            </span>
            {exhibit.exhibitDate && (
              <span>
                事件时间: {new Date(exhibit.exhibitDate).toLocaleDateString("zh-CN")}
              </span>
            )}
          </div>

          {exhibit.tags && exhibit.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {exhibit.tags.map((tag: any) => (
                <span
                  key={tag.id}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                >
                  #{tag.tag.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Cover Image */}
        {exhibit.coverImage && (
          <div className="relative h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
            <Image
              src={exhibit.coverImage}
              alt={exhibit.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="museum-card p-8 mb-8">
          <div className="exhibit-content">
            <ReactMarkdown>{exhibit.content}</ReactMarkdown>
          </div>
        </div>

        {/* Media Gallery - 暂时禁用，等数据库结构修复后恢复 */}
        {/* 
        {exhibit.media && exhibit.media.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              相关媒体
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {exhibit.media.map((media: any) => (
                <div key={media.id} className="museum-card p-4">
                  {media.type === "IMAGE" ? (
                    <div className="relative h-32 rounded-lg overflow-hidden">
                      <Image
                        src={media.url}
                        alt={media.name || "媒体文件"}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-32 flex items-center justify-center bg-gray-100 rounded-lg">
                      <span className="text-gray-500">
                        {media.type === "VIDEO" ? "🎥" : 
                         media.type === "AUDIO" ? "🎵" : "📄"}
                      </span>
                    </div>
                  )}
                  {media.name && (
                    <p className="text-sm text-gray-600 mt-2 truncate">
                      {media.name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        */}

        {/* Comments */}
        <div className="museum-card p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            评论 ({exhibit.comments?.length || 0})
          </h2>
          
          {!exhibit.comments || exhibit.comments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              还没有评论，成为第一个评论者吧！
            </p>
          ) : (
            <div className="space-y-6">
              {exhibit.comments.map((comment: any) => (
                <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start gap-3">
                    {comment.author.image && (
                      <Image
                        src={comment.author.image}
                        alt={comment.author.name || "用户"}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-900">
                          {comment.author.name || "匿名用户"}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString("zh-CN")}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                      
                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="ml-6 mt-4 space-y-4">
                          {comment.replies.map((reply: any) => (
                            <div key={reply.id} className="flex items-start gap-3">
                              {reply.author.image && (
                                <Image
                                  src={reply.author.image}
                                  alt={reply.author.name || "用户"}
                                  width={32}
                                  height={32}
                                  className="rounded-full"
                                />
                              )}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-gray-900 text-sm">
                                    {reply.author.name || "匿名用户"}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(reply.createdAt).toLocaleDateString("zh-CN")}
                                  </span>
                                </div>
                                <p className="text-gray-700 text-sm whitespace-pre-wrap">
                                  {reply.content}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            ← 返回首页
          </Link>
        </div>
      </div>
    );
  } catch (error) {
    console.error("展品页面错误:", error);
    notFound();
  }
}

function getEmotionColor(score: number): string {
  if (score <= 3) return "#ef4444"; // red
  if (score <= 5) return "#f59e0b"; // amber
  if (score <= 7) return "#10b981"; // emerald
  return "#3b82f6"; // blue
} 