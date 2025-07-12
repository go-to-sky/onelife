import { api } from "../trpc/server";
import Link from "next/link";
import Image from "next/image";

export default async function HomePage() {
  const { items: exhibits } = await api.exhibit.getAll({});
  const categories = await api.category.getAll();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          欢迎来到人生博物馆
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          这里收藏着生命中每一个珍贵的瞬间，每一份感动，每一次成长。
          让我们一起探索人生的美好与意义。
        </p>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">分类浏览</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/?category=${category.slug}`}
                className="category-badge"
                style={{ backgroundColor: category.color + "20", color: category.color }}
              >
                {category.icon && <span className="mr-1">{category.icon}</span>}
                {category.name}
                <span className="ml-1 text-xs opacity-75">
                  ({category._count.exhibits})
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Exhibits Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">最新展品</h2>
        {exhibits.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              还没有任何展品
            </h3>
            <p className="text-gray-600 mb-4">
              开始创建您的第一个展品，记录人生中的美好瞬间
            </p>
            <Link
              href="/admin"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              创建展品
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exhibits.map((exhibit) => (
              <Link
                key={exhibit.id}
                href={`/exhibit/${exhibit.slug}`}
                className="museum-card p-6 block hover:scale-105 transition-transform duration-200"
              >
                {exhibit.coverImage && (
                  <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                    <Image
                      src={exhibit.coverImage}
                      alt={exhibit.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="category-badge"
                    style={{ 
                      backgroundColor: exhibit.category.color + "20", 
                      color: exhibit.category.color 
                    }}
                  >
                    {exhibit.category.name}
                  </span>
                  {exhibit.emotionScore && (
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="mr-1">情绪:</span>
                      <div className="emotion-bar w-16">
                        <div
                          className="emotion-fill"
                          style={{
                            width: `${exhibit.emotionScore * 10}%`,
                            backgroundColor: getEmotionColor(exhibit.emotionScore),
                          }}
                        />
                      </div>
                      <span className="ml-1">{exhibit.emotionScore}/10</span>
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {exhibit.title}
                </h3>
                
                {exhibit.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {exhibit.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    {exhibit.user.image && (
                      <Image
                        src={exhibit.user.image}
                        alt={exhibit.user.name || "用户"}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                    )}
                    <span>{exhibit.user.name || "匿名用户"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>💬 {exhibit._count.comments}</span>
                    <span>{new Date(exhibit.createdAt).toLocaleDateString("zh-CN")}</span>
                  </div>
                </div>

                {exhibit.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {exhibit.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag.id}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        #{tag.tag.name}
                      </span>
                    ))}
                    {exhibit.tags.length > 3 && (
                      <span className="text-xs text-gray-400">
                        +{exhibit.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getEmotionColor(score: number): string {
  if (score <= 3) return "#ef4444"; // red
  if (score <= 5) return "#f59e0b"; // amber
  if (score <= 7) return "#10b981"; // emerald
  return "#3b82f6"; // blue
} 