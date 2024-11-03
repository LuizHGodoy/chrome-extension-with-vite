import { Task } from "./types/task";

chrome.alarms.onAlarm.addListener(async (alarm) => {
  const result = await chrome.storage.local.get<{ tasks: Task[] }>("tasks");
  const tasks = result.tasks || [];
  const task = tasks.find((t) => t.id === alarm.name);

  if (task) {
    await chrome.notifications.create(task.id, {
      type: "basic",
      iconUrl: "icon-128.png",
      title: "Lembrete de Tarefa",
      message: task.title,
      priority: 2,
      requireInteraction: true,
    });
  }
});
