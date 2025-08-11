"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../trpc/react";

export default function DeleteCommentButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const del = api.comment.delete.useMutation();

  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => {
        if (!confirm("确定删除此评论？")) return;
        setLoading(true);
        try {
          await del.mutateAsync({ id });
          router.refresh();
        } catch (e) {
          alert("删除失败或无权限");
        } finally {
          setLoading(false);
        }
      }}
      className="text-xs text-red-600 hover:text-red-800"
    >
      {loading ? "删除中..." : "删除"}
    </button>
  );
}


