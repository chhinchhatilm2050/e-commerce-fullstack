import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

const HomeView = () => import('@/views/HomeView.vue');
const RegisterView = () => import('@/views/auth/RegisterView.vue');
const LoginView = () => import('@/views/auth/LoginView.vue');
const VerifyEmailView = () => import('@/views/auth/VerifyEmailView.vue');
const ForgetPasswordView = () => import('@/views/auth/ForgetPasswordView.vue');
const CategoryPageView = () => import('@/views/product/ProductPerCategoryView.vue');
const SerchPageResult = () => import('@/views/product/SearchResultsPage.vue');
const ProductDetail = () => import('@/views/product/ProductDetailPageView.vue');
const CustomerServiceView = () => import('@/views/feature/CustomerServiceView.vue');
const NotFoundPageView = () => import('@/views/NotFoundView.vue');
const WishlistView = () => import('@/views/whishlist/WishlistView.vue');
const CheckoutView = () => import('@/views/checkoutandorder/CeckoutView.vue');
const OrderSuccessView = () => import('@/views/checkoutandorder/OrderSuccess.vue');
const MyOrdersView = () => import('@/views/checkoutandorder/MyOrderView.vue');
const OrderDetailView = () => import('@/views/checkoutandorder/OrderDetailView.vue');
const AdminLayoutView = () => import('@/layouts/AdminLayout.vue');
const DashboardOverview = () => import('@/views/admin/DashboardOverview.vue');
const OrdersListView = () => import('@/views/admin/OrdersListView.vue');
const ProductsListView = () => import('@/views/admin/ProductsListView.vue');
const CategoriesListView = () => import('@/views/admin/CategoriesListView.vue');
const CustomerListView = () => import('@/views/admin/CustomersListView.vue');

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { title: 'ChhatStore - Home', guestOnly: true },
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { title: 'ChhatStore - Home', guestOnly: true },
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { title: 'ChhatStore - Home', guestOnly: true },
  },
  {
    path: '/verify-email',
    name: 'verify-email',
    component: VerifyEmailView,
    meta: { title: 'ChhatStore - Home', guestOnly: true },
  },
  {
    path: '/forget-password',
    name: 'forget-password',
    component: ForgetPasswordView,
    meta: { title: 'ChhatStore - Home', guestOnly: true },
  },
  {
    path: '/products/category/:slug',
    name: 'category',
    component: CategoryPageView,
    meta: { title: 'ChhatStore - Category', guestOnly: true },
  },
  {
    path: '/search',
    name: 'search',
    component: SerchPageResult,
    meta: { title: 'ChhatStore - Category', guestOnly: true },
  },
  {
    path: '/products/:slug',
    name: 'productDetail',
    component: ProductDetail,
    meta: { title: 'ChhatStore - Category', guestOnly: true },
  },
  {
    path: '/category/:categorySlug/products/:slug',
    name: 'productDetailInCategory',
    component: ProductDetail,
    meta: { title: 'ChhatStore - Product Detail' },
  },
  {
    path: '/support',
    name: 'CustomerServiceView',
    component: CustomerServiceView,
    meta: { title: 'ChhatStore - Support' },
  },
  {
    path: '/wishlist',
    name: 'wishlist',
    component: WishlistView,
    meta: { title: 'ChhatStore - Wishlist' },
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: CheckoutView,
    meta: { title: 'ChhatStore - Checkout' },
  },
  {
    path: '/order-success',
    name: 'order-success',
    component: OrderSuccessView,
    meta: { title: 'ChhatStore - Checkout' },
  },
  {
    path: '/my-orders',
    name: 'my-orders',
    component: MyOrdersView,
    meta: { title: 'ChhatStore - Checkout' },
  },
  {
    path: '/order-detail/:id',
    name: 'order-detail',
    component: OrderDetailView,
    meta: { title: 'ChhatStore - Checkout' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    component: NotFoundPageView,
  },
  {
    path: '/admin',
    component: AdminLayoutView,
    redirect: '/admin/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'admin-dashboard',
        component: DashboardOverview,
        meta: { title: 'Dashboard Overview' },
      },
      {
        path: 'orders',
        name: 'admin-orders',
        component: OrdersListView,
        meta: { title: 'Order Management' },
      },
      {
        path: 'products',
        name: 'admin-products',
        component: ProductsListView,
        meta: { title: 'Product Catalog' },
      },
      {
        path: 'categories',
        name: 'admin-categories',
        component: CategoriesListView,
        meta: { title: 'Category Management' },
      },
      {
        path: 'customers',
        name: 'admin-customers',
        component: CustomerListView,
        meta: { title: 'Customer List' },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (to.path === from.path) {
      return false;
    }
    return { top: 0, behavior: 'smooth' };
  },
});

export default router;
