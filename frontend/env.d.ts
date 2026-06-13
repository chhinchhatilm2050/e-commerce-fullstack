/// <reference types="vite/client" />
import 'vue-router'
declare module 'vue-router' {
  interface RouteMeta {
    title?: string;
    guestOnly?: boolean;
    requiresAuth?: boolean;
    role?: 'admin' | 'user'
  }
}
