"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { arrayMove } from "@dnd-kit/sortable";
import TaskList from "@/components/TaskList";
import ThemeToggle from "@/components/ThemeToggle";

type Tag = { id: number; name: string; color: string };
type Task = { id: number; text: string; done: boolean; tags: Tag[] };
type Filter = "all" | "active" | "completed";

const TAG_COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#8b5cf6", "#14b8a6"];

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [filterTag, setFilterTag] = useState<number | null>(null);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const [showTagForm, setShowTagForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/tasks").then((res) => {
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      res.json().then(setTasks);
    });
    fetch("/api/tags")
      .then((res) => res.json())
      .then(setTags);
  }, [router]);

  async function addTask() {
    if (!input.trim()) return;
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input }),
    });
    const newTask = await res.json();
    setTasks((prev) => [...prev, newTask]);
    setInput("");
  }

  async function toggleTask(id: number) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !task.done }),
    });
    const updated = await res.json();
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }

  async function deleteTask(id: number) {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  async function updateTask(id: number, newText: string) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newText }),
    });
    const updated = await res.json();
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }

  async function updateTaskTags(id: number, tagIds: number[]) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tagIds }),
    });
    const updated = await res.json();
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }

  async function reorderTasks(activeId: number, overId: number) {
    const oldIndex = tasks.findIndex((t) => t.id === activeId);
    const newIndex = tasks.findIndex((t) => t.id === overId);
    const reordered = arrayMove(tasks, oldIndex, newIndex);
    setTasks(reordered);
    await Promise.all(
      reordered.map((task, index) =>
        fetch(`/api/tasks/${task.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ position: index }),
        }),
      ),
    );
  }

  async function createTag() {
    if (!newTagName.trim()) return;
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTagName, color: newTagColor }),
    });
    const tag = await res.json();
    setTags((prev) => [...prev, tag]);
    setNewTagName("");
    setShowTagForm(false);
  }

  async function deleteTag(id: number) {
    await fetch(`/api/tags?id=${id}`, { method: "DELETE" });
    setTags((prev) => prev.filter((t) => t.id !== id));
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const filteredTasks = tasks.filter((task) => {
    const statusMatch = filter === "active" ? !task.done : filter === "completed" ? task.done : true;
    const tagMatch = filterTag === null || task.tags.some((t) => t.id === filterTag);
    return statusMatch && tagMatch;
  });

  const completed = tasks.filter((t) => t.done).length;
  const active = tasks.length - completed;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Task Manager</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {active} active . {completed} done
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button onClick={logout} className="text-sm text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors">
              Log out
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <input
            className="flex-1 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-gray-400"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="New task..."
            onKeyDown={(e) => {
              if (e.key === "Enter") addTask();
            }}
          />
          <button
            onClick={addTask}
            disabled={!input.trim()}
            className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white px-5 py-3 rounded-xl text-sm font-medium transition-colors"
          >
            Add
          </button>
        </div>

        <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
          <div className="flex gap-1">
            {(["all", "active", "completed"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  filter === f ? "bg-indigo-500 text-white" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {f === "all" ? "All" : f === "active" ? "Active" : "Done"}
              </button>
            ))}
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setFilterTag(null)}
                className={`px-2 py-1 rounded-full text-xs font-medium transition-opacity ${
                  filterTag === null
                    ? "bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}
              >
                All tags
              </button>
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => setFilterTag(filterTag === tag.id ? null : tag.id)}
                  className="px-2 py-1 rounded-full text-xs font-medium text-white transition-opacity"
                  style={{
                    backgroundColor: tag.color,
                    opacity: filterTag === tag.id || filterTag === null ? 1 : 0.4,
                  }}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Tags</span>
            <button onClick={() => setShowTagForm(!showTagForm)} className="text-xs text-indigo-500 hover:text-indigo-600 transition-colors">
              {showTagForm ? "Cancel" : "+ New tag"}
            </button>
          </div>

          {showTagForm && (
            <div className="flex flex-wrap gap-2 mb-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <input
                placeholder="Tag name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") createTag();
                }}
                className="flex-1 min-w-32 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <div className="flex gap-1">
                {TAG_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewTagColor(c)}
                    className={`w-6 h-6 rounded-full transition-transform ${newTagColor === c ? "scale-125 ring-2 ring-offset-1 ring-gray-400" : ""}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <button
                onClick={createTag}
                disabled={!newTagName.trim()}
                className="bg-indigo-500 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
              >
                Create
              </button>
            </div>
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                  <button onClick={() => deleteTag(tag.id)} className="hover:opacity-75 font-bold ml-0.5">
                    x
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <TaskList
          tasks={filteredTasks}
          allTags={tags}
          onToggle={toggleTask}
          onDelete={deleteTask}
          onUpdate={updateTask}
          onUpdateTags={updateTaskTags}
          onReorder={reorderTasks}
        />

        {filteredTasks.length === 0 && <p className="text-center text-gray-400 dark:text-gray-600 text-sm mt-12">No tasks here.</p>}
      </div>
    </div>
  );
}
