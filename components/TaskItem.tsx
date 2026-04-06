"use client";

import { useState } from "react";

type Task = {
  id: number;
  text: string;
  done: boolean;
};

type Props = {
  task: Task;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, newText: string) => void;
};

export default function TaskItem({ task, onToggle, onDelete, onUpdate }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(task.text);

  function handleSave() {
    if (!text.trim()) return;

    onUpdate(task.id, text);
    setIsEditing(false);
  }

  return (
    <li className="flex justify-between items-center border p-2 rounded">
      {isEditing ? (
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
          }}
          className="border p-1 flex-1 mr-2"
        />
      ) : (
        <span onClick={() => onToggle(task.id)} className={`cursor-pointer flex-1 ${task.done ? "line-through text-gray-400" : ""}`}>
          {task.text}
        </span>
      )}

      <div className="flex gap-2 ml-2">
        {isEditing ? <button onClick={() => handleSave()}>💾</button> : <button onClick={() => setIsEditing(true)}>✏️</button>}

        <button onClick={() => onDelete(task.id)} className="text-red-500">
          X
        </button>
      </div>
    </li>
  );
}
