"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, ArrowLeft } from "lucide-react";

type User = { id: number; email: string; first_name: string; last_name: string; role: string };
type Task = {
  id: number;
  text: string;
  description?: string;
  due_date?: string;
  done: boolean;
  user_email: string;
  first_name: string;
  last_name: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [newText, setNewText] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newUserId, setNewUserId] = useState<number | "">("");

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/tasks").then((r) => {
        if (r.status === 403) {
          router.push("/");
          return [];
        }
        return r.json();
      }),
      fetch("/api/admin/users").then((r) => r.json()),
    ]).then(([t, u]) => {
      setTasks(t);
      setUsers(u);
      setLoading(false);
    });
  }, [router]);

  async function handleDelete(id: number) {
    await fetch(`/api/admin/tasks/${id}`, { method: "DELETE" });
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  async function handleCreate() {
    if (!newText.trim() || newUserId === "") return;
    const res = await fetch("/api/admin/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: newText,
        description: newDescription || null,
        due_date: newDueDate || null,
        user_id: newUserId,
      }),
    });
    const created = await res.json();
    const user = users.find((u) => u.id === newUserId);
    setTasks((prev) => [
      {
        ...created,
        user_email: user?.email ?? "",
        first_name: user?.first_name ?? "",
        last_name: user?.last_name ?? "",
      },
      ...prev,
    ]);
    setNewText("");
    setNewDescription("");
    setNewDueDate("");
    setNewUserId("");
  }

  async function handleToggleAdmin(user: User) {
    const newRole = user.role === "admin" ? "user" : "admin";
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, role: newRole }),
    });
    const updated = await res.json();
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{tasks.length} tasks in the system</p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        {/* Formulário de criação */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm mb-8 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Create task for user</h2>

          <select
            value={newUserId}
            onChange={(e) => setNewUserId(Number(e.target.value))}
            className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">Select a user...</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.first_name} {u.last_name} ({u.email})
              </option>
            ))}
          </select>

          <input
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Task title..."
            className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          <textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Description (optional)..."
            rows={2}
            className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />

          <input
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            className="border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          <button
            onClick={handleCreate}
            disabled={!newText.trim() || newUserId === ""}
            className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            Create task
          </button>
        </div>

        {/* Tabela de tasks */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4 text-left">Task</th>
                <th className="px-6 py-4 text-left">User</th>
                <th className="px-6 py-4 text-left">Due date</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className={`font-medium ${task.done ? "line-through text-gray-400" : "text-gray-800 dark:text-gray-100"}`}>{task.text}</p>
                    {task.description && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{task.description}</p>}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    <p>
                      {task.first_name} {task.last_name}
                    </p>
                    <p className="text-xs text-gray-400">{task.user_email}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{task.due_date ? new Date(task.due_date).toLocaleDateString("pt-BR") : "—"}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${task.done ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"}`}
                    >
                      {task.done ? "Done" : "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tasks.length === 0 && <p className="text-center text-gray-400 text-sm py-12">No tasks in the system.</p>}
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden mt-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4 text-left">User</th>
                <th className="px-6 py-4 text-left">Email</th>
                <th className="px-6 py-4 text-left">Role</th>
                <th className="px-6 py-4 text-left"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 text-gray-800 dark:text-gray-100">
                    {user.first_name} {user.last_name}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{user.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleToggleAdmin(user)} className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors">
                      {user.role === "admin" ? "Remove admin" : "Make admin"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
