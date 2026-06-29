import { ref } from 'vue';

interface Notification {
  id: number;
  message: string;
  type: string;
}

const notifications = ref<Notification[]>([]);
let nextId = 0;

export const useNotification = () => {
  const showNotification = (message: string, { type = 'success', duration = 3000 } = {}) => {
    const id = nextId++;
    notifications.value.push({ id, message, type }); 
    setTimeout(() => removeNotification(id), duration);
  };

  const removeNotification = (id: number) => {
    notifications.value = notifications.value.filter(n => n.id !== id);
  };

  return { notifications, showNotification, removeNotification }; 
};
