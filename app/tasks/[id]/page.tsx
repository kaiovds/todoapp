"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PenBox, CalendarDays, Trash2, Save, ArrowLeft } from "lucide-react";
import TagBadge from "@/components/TagBadge";

type Tag = { id: number; name: string; color: string };
type Task = {
  id: number;
  text: string;
  description?: string;
  due_date?: string;
  done: boolean;
  tags: Tag[];
};

export default function TaskPage() {
  const { id } = useParams();
  const router = useRouter();

  const [task, setTask] = useState<Task | null>(null);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [text, setText] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetch(`/api/tasks/${id}`).then((res) => {
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.status === 404) {
        router.push("/");
        return;
      }
      res.json().then((data: Task) => {
        setTask(data);
        setText(data.text);
        setDescription(data.description ?? "");
        setDueDate(data.due_date?.slice(0, 10) ?? "");
        setLoading(false);
      });
    });
    fetch("/api/tags")
      .then((r) => r.json())
      .then(setAllTags);
  }, [id, router]);

  async function handleSave() {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, description, due_date: dueDate || null }),
    });
    const updated = await res.json();
    setTask(updated);
  }

  async function handleToggle() {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !task?.done }),
    });
    const updated = await res.json();
    setTask(updated);
  }

  async function handleDelete() {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    router.push("/");
  }

  async function toggleTag(tagId: number) {
    if (!task) return;
    const currentIds = task.tags.map((t) => t.id);
    const newIds = currentIds.includes(tagId) ? currentIds.filter((i) => i !== tagId) : [...currentIds, tagId];
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tagIds: newIds }),
    });
    const updated = await res.json();
    setTask(updated);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;
  if (!task) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <button onClick={handleDelete} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-600 transition-colors">
            <Trash2 size={16} /> Delete
          </button>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm space-y-6">
          {/* Completed */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={task.done} onChange={handleToggle} className="h-4 w-4 rounded accent-indigo-500" />
            <span className={`text-sm font-medium ${task.done ? "line-through text-gray-400" : "text-gray-700 dark:text-gray-200"}`}>
              {task.done ? "Completed" : "Mark as completed"}
            </span>
          </label>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Title</label>
            {isEditing ? (
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            ) : (
              <p className="text-sm text-gray-800 dark:text-gray-100 px-1">{text}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Description</label>
            {isEditing ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                placeholder="Add a description..."
              />
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 px-1">{description || "—"}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              <CalendarDays size={14} className="inline mr-1" />
              Due date
            </label>
            {isEditing ? (
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 px-1">{dueDate ? new Date(dueDate).toLocaleDateString("pt-BR") : "—"}</p>
            )}
          </div>

          {/* Tags */}
          {allTags.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {isEditing ? (
                  allTags.map((tag) => {
                    const active = task.tags.some((t) => t.id === tag.id);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => toggleTag(tag.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium text-white transition-opacity ${active ? "opacity-100 ring-2 ring-offset-1 ring-gray-400" : "opacity-40 hover:opacity-70"}`}
                        style={{ backgroundColor: tag.color }}
                      >
                        {tag.name}
                      </button>
                    );
                  })
                ) : task.tags.length > 0 ? (
                  task.tags.map((tag) => <TagBadge key={tag.id} tag={tag} />)
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 px-1">—</p>
                )}
              </div>
            </div>
          )}

          {/* Save or Edit*/}
          {isEditing ? (
            <button
              onClick={() => {
                handleSave();
                setIsEditing(false);
              }}
              className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              <Save size={16} /> Save changes
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              <PenBox size={16} /> Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
