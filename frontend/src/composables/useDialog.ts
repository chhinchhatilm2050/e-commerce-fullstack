import { ref } from 'vue'

export const useDialog = () => {
  const isOpen = ref<boolean>(false)
  const open = (): void => { isOpen.value = true }
  const close = (): void => { isOpen.value = false }
  const toggle = (): void => { isOpen.value = !isOpen.value }

  return { isOpen, open, close, toggle }
}
