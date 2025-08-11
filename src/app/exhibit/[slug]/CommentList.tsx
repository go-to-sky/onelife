"use client";

import { useState } from "react";
import Image from "next/image";
import { api } from "../../../trpc/react";
import DeleteCommentButton from "./DeleteCommentButton";

export default function CommentList({ exhibitId }: { exhibitId: string }) {
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [items, setItems] = useState<any[]>([]);
  const { data, isLoading, refetch } = api.comment.list.useQuery(
    { exhibitId, limit: 10, cursor },
    { keepPreviousData: true, onSuccess: (res) => { if (cursor) setItems(prev => [...prev, ...res.items]); else setItems(res.items); } }
  );

  const list = cursor ? items : (data?.items ?? []);
  const nextCursor = data?.nextCursor;

  return (
    <div className="space-y-6">
      {list.length === 0 ? (
        <p className="text-gray-500 text-center py-8">还没有评论，成为第一个评论者吧！</p>
      ) : (
        list.map((comment) => (
          <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-b-0">
            <div className="flex items-start gap-3">
              {comment.author?.image && (
                <Image src={comment.author.image} alt={comment.author.name || "用户"} width={40} height={40} className="rounded-full" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-gray-900">{comment.author?.name || "匿名用户"}</span>
                  <span className="text-sm text-gray-500">{new Date(comment.createdAt).toLocaleDateString("zh-CN")}</span>
                  <DeleteCommentButton id={comment.id} />
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-6 mt-4 space-y-4">
                    {comment.replies.map((reply: any) => (
                      <div key={reply.id} className="flex items-start gap-3">
                        {reply.author?.image && (
                          <Image src={reply.author.image} alt={reply.author.name || "用户"} width={32} height={32} className="rounded-full" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 text-sm">{reply.author?.name || "匿名用户"}</span>
                            <span className="text-xs text-gray-500">{new Date(reply.createdAt).toLocaleDateString("zh-CN")}</span>
                            <DeleteCommentButton id={reply.id} />
                          </div>
                          <p className="text-gray-700 text-sm whitespace-pre-wrap">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <ReplyBox parentId={comment.id} exhibitId={exhibitId} onSubmitted={() => refetch()} />
              </div>
            </div>
          </div>
        ))
      )}

      {nextCursor && (
        <div className="text-center">
          <button
            className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
            onClick={() => setCursor(nextCursor)}
            disabled={isLoading}
          >
            {isLoading ? "加载中..." : "加载更多"}
          </button>
        </div>
      )}
    </div>
  );
}

function ReplyBox({ parentId, exhibitId, onSubmitted }: { parentId: string; exhibitId: string; onSubmitted: () => void; }) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const create = api.comment.create.useMutation();

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!value.trim()) return;
        setLoading(true);
        try {
          await create.mutateAsync({ exhibitId, content: value, parentId });
          setValue("");
          onSubmitted();
        } finally {
          setLoading(false);
        }
      }}
      className="mt-3"
    >
      <textarea
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={2}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="回复该评论..."
      />
      <div className="flex justify-end mt-2">
        <button type="submit" disabled={loading || !value.trim()} className="text-sm px-3 py-1 bg-gray-800 text-white rounded">
          {loading ? "发送中..." : "回复"}
        </button>
      </div>
    </form>
  );
}


