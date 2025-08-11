"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "../../trpc/react";
import FileUpload from "./components/FileUpload";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

function AdminPageInner() {
  // 使用模拟管理员用户
  const mockSession = { 
    user: { 
      id: "temp-user", 
      name: "管理员", 
      email: "admin@example.com",
      isAdmin: true 
    } 
  };
  const session = mockSession;
  const status = "authenticated";
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // 获取URL参数中的分类信息
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  // 分类配置
  const categoryConfigs = {
    'milestones': {
      title: '大事记 / 人生里程碑',
      description: '记录对人生有重大影响或转折意义的事件',
      icon: '🏆',
      color: 'amber',
      examples: '毕业、第一份工作、升职、结婚、生子、买房、创业等'
    },
    'daily-joys': {
      title: '生活琐事 / 日常小确幸',
      description: '记录日常生活中微小但确切的幸福瞬间',
      icon: '🌸',
      color: 'green',
      examples: '美食、晚霞、好书、愉快长谈、午后阳光、宠物陪伴等'
    },
    'growth-challenges': {
      title: '挑战与成长',
      description: '记录遇到的困难、错误、恐惧以及成长经验',
      icon: '💪',
      color: 'blue',
      examples: '失败项目、争执反思、新技能学习、公开演讲挑战等'
    },
    'exploration': {
      title: '探索空间',
      description: '记录您的创意想法和独特的生活体验',
      icon: '🎯',
      color: 'purple',
      examples: '梦境记录、创意灵感、人际关系图谱、生活哲学等'
    },
    'entertainment-culture': {
      title: '娱乐文化',
      description: '记录您的文化消费和娱乐体验',
      icon: '🎬',
      color: 'orange',
      examples: '电影观后感、电视剧评价、读书笔记、音乐感受等'
    },
    'movies': {
      title: '电影',
      description: '记录观影体验和电影评价',
      icon: '🎬',
      color: 'red',
      examples: '电影观后感、影评、推荐清单等'
    },
    'tv-series': {
      title: '电视剧',
      description: '记录追剧体验和剧集评价',
      icon: '📺',
      color: 'blue',
      examples: '剧集评价、角色分析、剧情讨论等'
    },
    'books': {
      title: '书籍',
      description: '记录阅读体验和读书笔记',
      icon: '📚',
      color: 'green',
      examples: '读书笔记、书评、阅读感悟等'
    },
    'music': {
      title: '音乐',
      description: '记录音乐体验和感受',
      icon: '🎵',
      color: 'pink',
      examples: '歌曲推荐、音乐感受、演唱会体验等'
    }
  };
  
  const currentCategory = categoryParam ? categoryConfigs[categoryParam as keyof typeof categoryConfigs] : null;

  // 获取分类数据
  const { data: categories = [] } = api.category.getAll.useQuery();

  // 根据categoryParam获取目标分类ID
  const getTargetCategoryId = () => {
    if (!categoryParam || !categories.length) return undefined;
    
    const categoryMap: { [key: string]: string } = {
      'milestones': '人生账本',
      'daily-joys': '时间切片', 
      'growth-challenges': '情绪肖像',
      'exploration': '梦境档案',
      'entertainment-culture': '娱乐文化',
      'movies': '娱乐文化',
      'tv-series': '娱乐文化',
      'books': '娱乐文化',
      'music': '娱乐文化'
    };
    
    const targetCategoryName = categoryMap[categoryParam];
    const foundCategory = categories.find(cat => cat.name === targetCategoryName);
    return foundCategory ? foundCategory.id : undefined;
  };

  const targetCategoryId = getTargetCategoryId();

  // Queries - 根据分类过滤展品
  const { data: exhibits, refetch: refetchExhibits } = api.exhibit.getAll.useQuery(
    { 
      showAll: true, // 显示所有可见性的展品
      categoryId: targetCategoryId // 按分类过滤
    },
    { enabled: true }
  );

  // Mutations
  const createExhibit = api.exhibit.create.useMutation({
    onSuccess: async () => {
      setIsCreating(false);
      alert("展品创建成功！");
      // 刷新展品列表数据
      await refetchExhibits();
    },
    onError: (error) => {
      console.error("创建展品失败:", error);
      alert(`创建失败: ${error.message}`);
    },
  });

  const updateExhibit = api.exhibit.update.useMutation({
    onSuccess: async () => {
      setEditingId(null);
      alert("展品更新成功！");
      // 刷新展品列表数据
      await refetchExhibits();
    },
    onError: (error) => {
      console.error("更新展品失败:", error);
      alert(`更新失败: ${error.message}`);
    },
  });

  const deleteExhibit = api.exhibit.delete.useMutation({
    onSuccess: () => {
      refetchExhibits();
    },
  });

  // 获取正在编辑的展品数据
  const editingExhibit = exhibits?.items.find(exhibit => exhibit.id === editingId);

  // 暂时跳过登录检查

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          {currentCategory ? (
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{currentCategory.icon}</span>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{currentCategory.title}</h1>
                <p className="text-gray-600">{currentCategory.description}</p>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-gray-900">管理后台</h1>
              <p className="text-gray-600">
                管理和创建您的人生展品
              </p>
            </>
          )}
          {currentCategory && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>示例内容：</strong>{currentCategory.examples}
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {currentCategory && (
            <Link
              href="/"
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors text-sm"
            >
              ← 返回全部
            </Link>
          )}
          <button
            onClick={() => setIsCreating(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            {currentCategory ? `记录${currentCategory.title.split(' / ')[0]}` : '创建新展品'}
          </button>
        </div>
      </div>

      {/* Create Form Modal */}
      {isCreating && (
        <CreateExhibitForm
          categories={categories}
          onSubmit={(data) => createExhibit.mutate(data)}
          onCancel={() => setIsCreating(false)}
          isLoading={createExhibit.isLoading}
          categoryParam={categoryParam}
        />
      )}

      {/* Edit Form Modal */}
      {editingId && editingExhibit && (
        <EditExhibitForm
          categories={categories}
          exhibit={editingExhibit}
          onSubmit={(data: any) => updateExhibit.mutate({ id: editingId, ...data })}
          onCancel={() => setEditingId(null)}
          isLoading={updateExhibit.isLoading}
        />
      )}

      {/* Exhibits List */}
      <div className="space-y-6">
        {!exhibits?.items || exhibits.items.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">
              {currentCategory ? currentCategory.icon : '📝'}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {currentCategory 
                ? `还没有${currentCategory.title.split(' / ')[0]}记录` 
                : '还没有展品'
              }
            </h3>
            <p className="text-gray-600">
              {currentCategory 
                ? `开始记录您的${currentCategory.title.split(' / ')[0]}，${currentCategory.description}` 
                : '创建您的第一个展品来开始记录人生'
              }
            </p>
            {currentCategory && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg text-left max-w-md mx-auto">
                <p className="text-sm text-gray-700">
                  <strong>记录建议：</strong>{currentCategory.examples}
                </p>
              </div>
            )}
          </div>
        ) : (
          exhibits.items.map((exhibit) => (
            <div key={exhibit.id} className="museum-card p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="category-badge"
                      style={{
                        backgroundColor: exhibit.category.color + "20",
                        color: exhibit.category.color,
                      }}
                    >
                      {exhibit.category.name}
                    </span>
                    
                    {/* 显示特殊标签 */}
                    {exhibit.payload && typeof exhibit.payload === 'object' && 
                     'specialTags' in exhibit.payload && 
                     Array.isArray(exhibit.payload.specialTags) && 
                     exhibit.payload.specialTags.length > 0 && (
                      <div className="flex gap-1">
                        {(exhibit.payload.specialTags as string[]).map((tagId: string) => {
                          const tagLabels = {
                            'milestone': '🏆',
                            'daily-joy': '🌸', 
                            'growth': '💪',
                            'exploration': '🎯'
                          };
                          return (
                            <span
                              key={tagId}
                              className="text-xs px-1 py-0.5 bg-gray-100 rounded"
                              title={
                                tagId === 'milestone' ? '大事记 / 人生里程碑' :
                                tagId === 'daily-joy' ? '生活琐事 / 日常小确幸' :
                                tagId === 'growth' ? '挑战与成长' :
                                tagId === 'exploration' ? '探索空间' : ''
                              }
                            >
                              {tagLabels[tagId as keyof typeof tagLabels]}
                            </span>
                          );
                        })}
                      </div>
                    )}
                    
                    <span className="text-xs text-gray-500">
                      {exhibit.visibility}
                    </span>
                    {exhibit.emotionScore && (
                      <span className="text-xs text-gray-500">
                        情绪: {exhibit.emotionScore}/10
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {exhibit.title}
                  </h3>
                  {exhibit.description && (
                    <p className="text-gray-600 text-sm mb-2">
                      {exhibit.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>💬 {exhibit._count.comments} 评论</span>
                    <span>
                      创建于 {new Date(exhibit.createdAt).toLocaleDateString("zh-CN")}
                    </span>
                    <a
                      href={`/exhibit/${exhibit.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      查看详情 ↗
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => setEditingId(exhibit.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("确定要删除这个展品吗？")) {
                        deleteExhibit.mutate({ id: exhibit.id });
                      }
                    }}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-600">加载中...</div>}>
      <AdminPageInner />
    </Suspense>
  );
}

function EditExhibitForm({
  categories,
  exhibit,
  onSubmit,
  onCancel,
  isLoading,
}: {
  categories: any[];
  exhibit: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    title: exhibit.title || "",
    description: exhibit.description || "",
    content: exhibit.content || "",
    coverImage: exhibit.coverImage || "",
    categoryId: exhibit.categoryId || "",
    visibility: exhibit.visibility || "PUBLIC",
    emotionScore: exhibit.emotionScore || 5,
    tags: exhibit.tags?.map((tag: any) => (tag as any).tag.name).join(", ") || "",
    exhibitDate: exhibit.exhibitDate ? new Date(exhibit.exhibitDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    specialTags: (exhibit.payload?.specialTags as string[]) || [], // 从 payload 中读取特殊标签
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content || !formData.categoryId) {
      alert("请填写必填字段");
      return;
    }

    const submitData = {
      ...formData,
      tags: formData.tags ? formData.tags.split(",").map((tag: string) => tag.trim()) : [],
      exhibitDate: new Date(formData.exhibitDate),
      payload: {
        specialTags: formData.specialTags, // 将特殊标签保存到 payload
      },
    };
    
    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">编辑展品</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                标题 *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                描述
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                内容 * (支持 Markdown)
              </label>
              <textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="在这里写下您的故事..."
                required
              />
            </div>

            <div>
              <FileUpload
                onFileChange={(fileData) => setFormData({ ...formData, coverImage: fileData || "" })}
                currentValue={formData.coverImage}
                accept="image/*,video/*"
                maxSize={5}
                label="封面图片/视频"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  分类 *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">选择分类</option>
                  {Array.isArray(categories) && categories.length > 0 ? (
                    categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="temp-emotion-portraits">情绪肖像 🎭</option>
                      <option value="temp-dream-archives">梦境档案 💭</option>
                      <option value="temp-digital-archaeology">数字考古 💻</option>
                      <option value="temp-body-chronicle">身体编年史 💪</option>
                      <option value="temp-temporal-slices">时间切片 ⏰</option>
                      <option value="temp-life-ledger">人生账本 💰</option>
                      <option value="temp-shadow-collection">阴影馆藏 🌑</option>
                      <option value="temp-alternate-reality">平行时空 🌌</option>
                      <option value="temp-recurring-motifs">母题地图 🗺️</option>
                      <option value="temp-lexicon-collection">语言收藏 📚</option>
                      <option value="temp-entertainment-culture">娱乐文化 🎬</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  可见性
                </label>
                <select
                  value={formData.visibility}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      visibility: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PUBLIC">公开</option>
                  <option value="PRIVATE">私密</option>
                  <option value="UNLISTED">不公开</option>
                  <option value="SHARED">共享</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                情绪评分 (1-10)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.emotionScore}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emotionScore: parseInt(e.target.value),
                  })
                }
                className="w-full"
              />
              <div className="text-center text-sm text-gray-600">
                {formData.emotionScore}/10
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                事件发生时间
              </label>
              <input
                type="datetime-local"
                value={formData.exhibitDate}
                onChange={(e) =>
                  setFormData({ ...formData, exhibitDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                标签 (用逗号分隔)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                placeholder="回忆, 成长, 感悟"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                特殊标签 (可选，可多选)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'milestone', label: '大事记 / 人生里程碑', color: 'amber' },
                  { id: 'daily-joy', label: '生活琐事 / 日常小确幸', color: 'green' },
                  { id: 'growth', label: '挑战与成长', color: 'blue' },
                  { id: 'exploration', label: '探索空间', color: 'purple' }
                ].map((tag) => (
                  <label key={tag.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.specialTags.includes(tag.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            specialTags: [...formData.specialTags, tag.id]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            specialTags: formData.specialTags.filter(t => t !== tag.id)
                          });
                        }
                      }}
                      className="mr-2"
                    />
                    <span className={`text-sm px-2 py-1 rounded-full bg-${tag.color}-100 text-${tag.color}-800`}>
                      {tag.label}
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                这些标签帮助您更好地分类和回顾人生记录
              </p>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? "更新中..." : "更新展品"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function CreateExhibitForm({
  categories,
  onSubmit,
  onCancel,
  isLoading,
  categoryParam,
}: {
  categories: any[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
  categoryParam?: string | null;
}) {
  // 根据categoryParam预设分类
  const getInitialCategoryId = () => {
    if (!categoryParam || !categories.length) return "";
    
    // 根据categoryParam找到对应的分类
    const categoryMap: { [key: string]: string } = {
      'milestones': '人生账本',
      'daily-joys': '时间切片', 
      'growth-challenges': '情绪肖像',
      'exploration': '梦境档案'
    };
    
    const targetCategoryName = categoryMap[categoryParam];
    const foundCategory = categories.find(cat => cat.name === targetCategoryName);
    return foundCategory ? foundCategory.id : "";
  };

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    coverImage: "",
    categoryId: getInitialCategoryId(),
    visibility: "PUBLIC" as const,
    emotionScore: 5,
    tags: "",
    exhibitDate: new Date().toISOString().slice(0, 16), // 默认为当前时间
    specialTags: [] as string[], // 添加特殊标签字段
  });

  // 当categories加载完成后，更新categoryId
  useEffect(() => {
    if (categoryParam && categories.length > 0 && !formData.categoryId) {
      const initialCategoryId = getInitialCategoryId();
      if (initialCategoryId) {
        setFormData(prev => ({ ...prev, categoryId: initialCategoryId }));
      }
    }
  }, [categories, categoryParam, formData.categoryId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content || !formData.categoryId) {
      alert("请填写必填字段");
      return;
    }

    // 处理临时分类ID映射
    let categoryId = formData.categoryId;
    const tempCategoryMap: { [key: string]: string } = {
      'temp-emotion-portraits': 'emotion-portraits',
      'temp-dream-archives': 'dream-archives', 
      'temp-digital-archaeology': 'digital-archaeology',
      'temp-body-chronicle': 'body-chronicle',
      'temp-temporal-slices': 'temporal-slices',
      'temp-life-ledger': 'life-ledger',
      'temp-shadow-collection': 'shadow-collection',
      'temp-alternate-reality': 'alternate-reality',
      'temp-recurring-motifs': 'recurring-motifs',
      'temp-lexicon-collection': 'lexicon-collection',
      'temp-entertainment-culture': 'entertainment-culture'
    };
    
    if (categoryId.startsWith('temp-')) {
      categoryId = tempCategoryMap[categoryId] || categoryId;
    }

    const submitData = {
      ...formData,
      categoryId,
      tags: formData.tags ? formData.tags.split(",").map((tag: string) => tag.trim()) : [],
      exhibitDate: new Date(formData.exhibitDate), // 转换用户选择的时间
      payload: {
        specialTags: formData.specialTags, // 将特殊标签保存到 payload
      },
    };
    
    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">创建新展品</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                标题 *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                描述
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                内容 * (支持 Markdown)
              </label>
              <textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="在这里写下您的故事..."
                required
              />
            </div>

            <div>
              <FileUpload
                onFileChange={(fileData) => setFormData({ ...formData, coverImage: fileData || "" })}
                currentValue={formData.coverImage}
                accept="image/*,video/*"
                maxSize={5}
                label="封面图片/视频"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  分类 *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">选择分类</option>
                  {Array.isArray(categories) && categories.length > 0 ? (
                    categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                  ) : (
                    // 临时硬编码分类选项作为备选方案
                    <>
                      <option value="temp-emotion-portraits">情绪肖像 🎭</option>
                      <option value="temp-dream-archives">梦境档案 💭</option>
                      <option value="temp-digital-archaeology">数字考古 💻</option>
                      <option value="temp-body-chronicle">身体编年史 💪</option>
                      <option value="temp-temporal-slices">时间切片 ⏰</option>
                      <option value="temp-life-ledger">人生账本 💰</option>
                      <option value="temp-shadow-collection">阴影馆藏 🌑</option>
                      <option value="temp-alternate-reality">平行时空 🌌</option>
                      <option value="temp-recurring-motifs">母题地图 🗺️</option>
                      <option value="temp-lexicon-collection">语言收藏 📚</option>
                      <option value="temp-entertainment-culture">娱乐文化 🎬</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  可见性
                </label>
                <select
                  value={formData.visibility}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      visibility: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PUBLIC">公开</option>
                  <option value="PRIVATE">私密</option>
                  <option value="UNLISTED">不公开</option>
                  <option value="SHARED">共享</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                情绪评分 (1-10)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.emotionScore}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emotionScore: parseInt(e.target.value),
                  })
                }
                className="w-full"
              />
              <div className="text-center text-sm text-gray-600">
                {formData.emotionScore}/10
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                事件发生时间
              </label>
              <input
                type="datetime-local"
                value={formData.exhibitDate}
                onChange={(e) =>
                  setFormData({ ...formData, exhibitDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                标签 (用逗号分隔)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                placeholder="回忆, 成长, 感悟"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                特殊标签 (可选，可多选)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'milestone', label: '大事记 / 人生里程碑', color: 'amber' },
                  { id: 'daily-joy', label: '生活琐事 / 日常小确幸', color: 'green' },
                  { id: 'growth', label: '挑战与成长', color: 'blue' },
                  { id: 'exploration', label: '探索空间', color: 'purple' }
                ].map((tag) => (
                  <label key={tag.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.specialTags.includes(tag.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            specialTags: [...formData.specialTags, tag.id]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            specialTags: formData.specialTags.filter(t => t !== tag.id)
                          });
                        }
                      }}
                      className="mr-2"
                    />
                    <span className={`text-sm px-2 py-1 rounded-full bg-${tag.color}-100 text-${tag.color}-800`}>
                      {tag.label}
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                这些标签帮助您更好地分类和回顾人生记录
              </p>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? "创建中..." : "创建展品"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 