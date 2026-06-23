"use client";

import { FileText, Loader2 } from "lucide-react";

export default function HistoryTab({ history, loading, onSelect }: { history: any[]; loading: boolean; onSelect: (item: any) => void }) {
  if (loading) {
    return <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-emerald-500" size={24} /></div>
    </div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <FileText className="text-emerald-500" size={20} /> 历史记录
      </h2>
      {history.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <FileText size={48} className="mx-auto mb-3 opacity-50" />
          <p>还没有生成记录</p>
          <p className="text-sm">去"生成内容"开始你的第一篇种草笔记吧</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item: any) => (
            <div key={item.id} className="p-4 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
              onClick={() => onSelect(item)}>
              <div className="flex items-start justify-between mb-1">
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">{item.title || item.topic}</h4>
                <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString("zh-CN")}</span>
              </div>
              <p className="text-xs text-gray-500">平台: {item.platform} | 主题: {item.topic}</p>
              <div className="mt-1 flex gap-1">
                <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 text-[10px] rounded-full">{item.platform}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
