"use client";

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import TaskItem from "./TaskItem";

type Tag = { id: number; name: string; color: string };
type Task = { id: number; text: string; done: boolean; tags: Tag[]; description?: string; due_date?: string };
type Props = {
  tasks: Task[];
  // allTags: Tag[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  // onUpdate: (id: number, newText: string) => void;
  // onUpdateTags: (id: number, tagIds: number[]) => void;
  onReorder: (activeId: number, overId: number) => void;
};

export default function TaskList({ tasks, onToggle, onDelete, onReorder /*, allTags, onUpdate, onUpdateTags*/ }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorder(active.id as number, over.id as number);
    }
  }
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <ul className="space-y-2">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
