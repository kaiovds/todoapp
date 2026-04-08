"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TaskItem from "@/components/TaskItem";

type Task = {
  id: number;
  text: string;
  done: boolean;
};

type Filter = "all" | "active" | "completed";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/tasks").then((res) => {
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      res.json().then((data) => setTasks(data));
    });
  }, []);

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
    setTasks((prev) => prev.map((task) => (task.id === id ? updated : task)));
  }

  async function deleteTask(id: number) {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }

  async function updateTask(id: number, newText: string) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newText }),
    });
    const updated = await res.json();
    setTasks((prev) => prev.map((task) => (task.id === id ? updated : task)));
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return !task.done;
    if (filter === "completed") return task.done;
    return true;
  });

  const total = tasks.length;
  const completed = tasks.filter((t) => t.done).length;
  const active = total - completed;

  return (
    <main className="p-6 max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Task Manager</h1>
        <button onClick={logout} className="text-sm text-red-500 underline">
          Sair
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          className="border p-2 flex-1 rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="New task..."
          onKeyDown={(e) => {
            if (e.key === "Enter") addTask();
          }}
        />
        <button onClick={addTask} disabled={!input.trim()} className="bg-blue-500 text-white px-4 rounded disabled:opacity-50">
          Add
        </button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button onClick={() => setFilter("all")} className={filter === "all" ? "font-bold underline" : ""}>
            All
          </button>
          <button onClick={() => setFilter("active")} className={filter === "active" ? "font-bold underline" : ""}>
            Active
          </button>
          <button onClick={() => setFilter("completed")} className={filter === "completed" ? "font-bold underline" : ""}>
            Completed
          </button>
        </div>

        <div className="text-sm text-gray-600">
          {active} active / {completed} done
        </div>
      </div>

      <ul className="space-y-2">
        {filteredTasks.map((task) => (
          <TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} onUpdate={updateTask} />
        ))}
      </ul>
    </main>
  );
}
