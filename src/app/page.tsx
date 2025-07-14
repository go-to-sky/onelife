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

      {/* Life Record Categories */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">人生记录分类</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* 大事记 / 人生里程碑 */}
          <div className="museum-card p-6 hover:scale-105 transition-transform duration-200 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🏆</div>
              <h3 className="text-lg font-semibold text-amber-800">
                大事记 / 人生里程碑
              </h3>
              <p className="text-xs text-amber-600 uppercase tracking-wide font-medium">
                Milestones
              </p>
            </div>
            <p className="text-sm text-amber-700 mb-4 leading-relaxed">
              对人生有重大影响或转折意义的事件。毕业、第一份工作、升职、结婚、生子、买房、创业等关键节点。
            </p>
            <div className="text-xs text-amber-600 bg-amber-100 rounded-lg p-2">
              <strong>记录目的：</strong>构建个人生命史，回顾人生的关键节点和成长轨迹。可以每年年底整理一次，形成年度大事记。
            </div>
            <Link 
              href="/admin"
              className="inline-block w-full text-center mt-4 px-3 py-2 bg-amber-200 text-amber-800 rounded-md text-sm font-medium hover:bg-amber-300 transition-colors"
            >
              记录里程碑
            </Link>
          </div>

          {/* 生活琐事 / 日常小确幸 */}
          <div className="museum-card p-6 hover:scale-105 transition-transform duration-200 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🌸</div>
              <h3 className="text-lg font-semibold text-green-800">
                生活琐事 / 日常小确幸
              </h3>
              <p className="text-xs text-green-600 uppercase tracking-wide font-medium">
                Daily Trifles & Small Joys
              </p>
            </div>
            <p className="text-sm text-green-700 mb-4 leading-relaxed">
              日常生活中那些微小但确切的幸福瞬间。美食、晚霞、好书、愉快长谈、午后阳光、宠物陪伴等。
            </p>
            <div className="text-xs text-green-600 bg-green-100 rounded-lg p-2">
              <strong>记录目的：</strong>培养感恩和发现美的能力，提升幸福感，对抗生活的平淡和焦虑。
            </div>
            <Link 
              href="/admin"
              className="inline-block w-full text-center mt-4 px-3 py-2 bg-green-200 text-green-800 rounded-md text-sm font-medium hover:bg-green-300 transition-colors"
            >
              记录小确幸
            </Link>
          </div>

          {/* 挑战与成长 */}
          <div className="museum-card p-6 hover:scale-105 transition-transform duration-200 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">💪</div>
              <h3 className="text-lg font-semibold text-blue-800">
                挑战与成长
              </h3>
              <p className="text-xs text-blue-600 uppercase tracking-wide font-medium">
                Challenges & Growth
              </p>
            </div>
            <p className="text-sm text-blue-700 mb-4 leading-relaxed">
              遇到的困难、犯下的错误、克服的恐惧以及从中得到的经验和教训。失败项目、争执反思、新技能学习等。
            </p>
            <div className="text-xs text-blue-600 bg-blue-100 rounded-lg p-2">
              <strong>记录目的：</strong>复盘和反思，将挫折转化为成长的养分，看到自己的坚韧和进步。
            </div>
            <Link 
              href="/admin"
              className="inline-block w-full text-center mt-4 px-3 py-2 bg-blue-200 text-blue-800 rounded-md text-sm font-medium hover:bg-blue-300 transition-colors"
            >
              记录成长
            </Link>
          </div>

          {/* 待定分类 */}
          <div className="museum-card p-6 hover:scale-105 transition-transform duration-200 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🎯</div>
              <h3 className="text-lg font-semibold text-purple-800">
                探索空间
              </h3>
              <p className="text-xs text-purple-600 uppercase tracking-wide font-medium">
                To Be Defined
              </p>
            </div>
            <p className="text-sm text-purple-700 mb-4 leading-relaxed">
              等待发现的人生新维度。也许是梦境记录、创意灵感、人际关系图谱，或是您独特的生活哲学...
            </p>
            <div className="text-xs text-purple-600 bg-purple-100 rounded-lg p-2">
              <strong>等待您来定义：</strong>这个空间留给您的创意和想象，定制属于您的独特记录方式。
            </div>
            <Link 
              href="/admin"
              className="inline-block w-full text-center mt-4 px-3 py-2 bg-purple-200 text-purple-800 rounded-md text-sm font-medium hover:bg-purple-300 transition-colors"
            >
              开始探索
            </Link>
          </div>
        </div>

        {/* 最新展品预览 */}
        {exhibits.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">最新记录</h3>
              <Link 
                href="/admin"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                查看全部 →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {exhibits.slice(0, 3).map((exhibit) => (
                <Link
                  key={exhibit.id}
                  href={`/exhibit/${exhibit.slug}`}
                  className="museum-card p-4 block hover:scale-105 transition-transform duration-200"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="category-badge text-xs"
                      style={{ 
                        backgroundColor: exhibit.category.color + "20", 
                        color: exhibit.category.color 
                      }}
                    >
                      {exhibit.category.name}
                    </span>
                    {exhibit.emotionScore && (
                      <div className="flex items-center text-xs text-gray-500">
                        <span className="mr-1">情绪:</span>
                        <div className="emotion-bar w-12">
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

                  <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                    {exhibit.title}
                  </h4>
                  
                  {exhibit.description && (
                    <p className="text-gray-600 text-xs mb-2 line-clamp-2">
                      {exhibit.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{exhibit.user.name || "匿名用户"}</span>
                    <span>{new Date(exhibit.createdAt).toLocaleDateString("zh-CN")}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {exhibits.length === 0 && (
          <div className="text-center py-8 mt-8 bg-gray-50 rounded-lg">
            <div className="text-gray-400 text-4xl mb-3">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              开始您的人生记录之旅
            </h3>
            <p className="text-gray-600 mb-4">
              选择一个分类，记录您人生中的珍贵瞬间
            </p>
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