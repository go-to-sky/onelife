"use client";

import { useState } from "react";
import { api } from "../../../trpc/react";

export default function CommentForm({ exhibitId, onSubmitted }: { exhibitId: string; onSubmitted?: () => void; }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const createComment = api.comment.create.useMutation();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      await createComment.mutateAsync({ exhibitId, content });
      setContent("");
      onSubmitted?.();
    } catch (err) {
      console.error(err);
      alert("评论提交失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-6">
      <label className="block text-sm font-medium text-gray-700 mb-1">发表评论</label>
      <textarea
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={3}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="写下你的想法..."
      />
      <div className="flex justify-end mt-3">
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "提交中..." : "发布评论"}
        </button>
      </div>
    </form>
  );
}


