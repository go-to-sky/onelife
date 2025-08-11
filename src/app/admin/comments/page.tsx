"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "../../../trpc/react";

export default function AdminCommentsPage() {
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [items, setItems] = useState<any[]>([]);
  const { data, isLoading, refetch } = api.comment.adminList.useQuery(
    { limit: 20, cursor },
    { keepPreviousData: true, onSuccess: (res) => { if (cursor) setItems(prev => [...prev, ...res.items]); else setItems(res.items); } }
  );

  const list = cursor ? items : (data?.items ?? []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">评论管理</h1>
        <Link href="/admin" className="text-sm text-blue-600 hover:text-blue-800">← 返回管理台</Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">时间</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">用户</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">内容</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">展品</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {list.map((c) => (
              <tr key={c.id} className="align-top">
                <td className="px-3 py-2 text-sm text-gray-500">{new Date(c.createdAt).toLocaleString()}</td>
                <td className="px-3 py-2 text-sm">{c.author?.name || '匿名'}</td>
                <td className="px-3 py-2 text-sm max-w-[420px] whitespace-pre-wrap">{c.content}</td>
                <td className="px-3 py-2 text-sm">
                  <Link href={`/exhibit/${c.exhibit.slug}`} className="text-blue-600 hover:text-blue-800">{c.exhibit.title}</Link>
                </td>
                <td className="px-3 py-2 text-right">
                  <DeleteBtn id={c.id} onDeleted={() => refetch()} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data?.nextCursor && (
          <div className="p-3 text-center">
            <button className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800" disabled={isLoading} onClick={() => setCursor(data.nextCursor!)}>
              {isLoading ? '加载中...' : '加载更多'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function DeleteBtn({ id, onDeleted }: { id: string; onDeleted: () => void }) {
  const del = api.comment.delete.useMutation();
  return (
    <button
      className="text-sm text-red-600 hover:text-red-800"
      onClick={async () => {
        if (!confirm('确定删除此评论？')) return;
        await del.mutateAsync({ id });
        onDeleted();
      }}
    >删除</button>
  );
}


