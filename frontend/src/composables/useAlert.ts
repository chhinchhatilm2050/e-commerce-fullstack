import { ref } from 'vue';

interface Alert {
  id: number;
  message: string;
  type: string;
}

const alerts = ref<Alert[]>([]);
let nextId = 0;

export const useAlert = () => {
  const showAlert = (message: string, { type = 'success', duration = 3000 } = {}) => {
    const id = nextId++;
    alerts.value.push({ id, message, type }); 
    setTimeout(() => removeAlert(id), duration);
  };

  const removeAlert = (id: number) => {
    alerts.value = alerts.value.filter(n => n.id !== id);
  };

  return { alerts, showAlert, removeAlert }; 
};
