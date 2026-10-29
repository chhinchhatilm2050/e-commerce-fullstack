<script setup lang="ts">
  import { ref, onMounted, computed, watch } from 'vue';
  import { useAlert } from '@/composables/useAlert';
  import userFilterBar from '@/components/admin/userSession/userFilterBar.vue';
  import userListTable from '@/components/admin/userSession/userListTable.vue';
  import userStatusCards from '@/components/admin/userSession/userStatusCards.vue';
  import { useUserAdminStore } from '@/stores/adminUser';
  import userPagination from '@/components/admin/userSession/userPagination.vue';
  import DeleteConfirmModal from '@/components/admin/productSession/DeleteConfirmModal.vue';
  import RestoreConfirmModel from '@/components/admin/productSession/RestoreConfirmModel.vue';
  import userViewModel from '@/components/admin/userSession/userViewModel.vue';

  const { showAlert } = useAlert();
  const userAdminStore = useUserAdminStore();

  const currentPage = ref<number>(1);
  const itemsPerPage = ref<number>(10);
  const searchInput = ref<string>('');
  const isTrashView = ref<boolean>(false);
  const isDeleteModalOpen = ref<boolean>(false);
  const isDeletePermanentModalOpen = ref<boolean>(false);
  const isUserDetailsOpen = ref<boolean>(false);
  const userToDelete = ref<{ id: string; name: string } | null>(null);
  const selectedUser = ref<{ id: string; name: string } | null>(null);
  const isRestoreModalOpeon = ref<boolean>(false);

  const tableContainerRef = ref<HTMLElement | null>(null);
  const selectedUsersFilter = ref<string>('All Status');
  const searchDisable = computed(() => searchInput.value.trim() === '');
  const activeSearchQuery = ref('');

  const loadUsers = async () => {
    const params: Record<string, string | number> = {
      page: currentPage.value,
      limit: itemsPerPage.value,
      isDeleted: isTrashView.value ? 'true' : 'false',
    };
    if (activeSearchQuery.value.trim()) {
      params.search = activeSearchQuery.value.trim();
    }

    if (!isTrashView.value && selectedUsersFilter.value !== 'All Status') {
      params.status = selectedUsersFilter.value;
    } 

    await userAdminStore.fetchUsers(params);

    if (tableContainerRef.value) {
      tableContainerRef.value.scrollTop = 0;
    }
  };

  const goToPreviousPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--;
      loadUsers();
    }
  };

  const goToNextPage = () => {
    if (currentPage.value < (userAdminStore.pagination?.totalPages || 1)) {
      currentPage.value++;
      loadUsers();
    }
  };

  const handleSearch = () => {
    activeSearchQuery.value = searchInput.value;
    currentPage.value = 1;
    loadUsers();
    searchInput.value = '';
  };

  const handleRefresh = async () => {
    selectedUsersFilter.value = 'All Status';
    searchInput.value = '';
    userAdminStore.clearCache();
    await userAdminStore.getUserStatus();
    await loadUsers();
  };

  const handleStatusChange = async ({ id, status }: { id: string; status: 'active' | 'inactive' | 'blocked' }) => {
    const result = await userAdminStore.updateUserStatus(id, status);
    if (result.success) {
      showAlert(result.message, { type: 'success' });
    } else {
      showAlert(result.message, { type: 'error' });
    }
  };

  // const handleViewCustomer = (customer: any) => {
  //   // Handle viewing customer details modal
  // };

  onMounted(async () => {
    await userAdminStore.getUserStatus();
    await loadUsers();
  });

  watch([selectedUsersFilter, isTrashView], () => {
    currentPage.value = 1;
    loadUsers();
  });
  const userStatusOptions = [
    { label: 'All Status', value: 'All Status' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Bloacked', value: 'blocked' },
  ];

  const handleOpenDeleteModal = (payload: { id: string; name: string }) => {
    userToDelete.value = payload;
    isDeleteModalOpen.value = true;
  };

  const handleOpenUserDetails = async (user: { _id: string }) => {
    isUserDetailsOpen.value = true;
    await userAdminStore.fetchUserById(user._id);
  };

  const handlePromoteUser = async (id: string) => {
    const result = await userAdminStore.promoteUser(id);
    showAlert(result.message, { type: result.success ? 'success' : 'error' });
    isUserDetailsOpen.value = false;
    
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete.value) return;
    const result = await userAdminStore.deleteUser(userToDelete.value.id);
    if (result?.success) {
      showAlert(result.message, { type: 'success' });
    }
    isDeleteModalOpen.value = false;
    userToDelete.value = null;
    await loadUsers();
  };

  const handleOpenDeletePermanentModal = async (payload: { id: string; name: string }) => {
    userToDelete.value = payload;
    isDeletePermanentModalOpen.value = true;
  };

  const handlePermanentDelete = async () => {
    if (!userToDelete.value) return;
    const result = await userAdminStore.deleteUserPermanently(userToDelete.value.id);
    if (result?.success) {
      showAlert(result.message, { type: 'success' });
    }
    isDeletePermanentModalOpen.value = false;
    userToDelete.value = null;
    userAdminStore.clearCache();
    await loadUsers();
  };

  const handleOpenRestoreModal = (payload: { id: string; name: string }) => {
    selectedUser.value = payload;
    isRestoreModalOpeon.value = true;
  };

  const handleConfirmRestore = async () => {
    if (!selectedUser.value) return;
    const result = await userAdminStore.restoreUser(selectedUser.value.id);
    if (result?.success) {
      showAlert(result.message, { type: 'success' });
    }
    isRestoreModalOpeon.value = false;
    selectedUser.value = null;
    userAdminStore.clearCache();
    await loadUsers();
  };
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-96px)] gap-4">
    <!-- Header Row -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#cdd0d5]/70 p-5 rounded-lg shrink-0 animate-slide-up">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-white text-black/80 shadow-lg rounded-lg">
          <i class="ri-user-shared-line text-2xl"></i>
        </div>
        <div>
          <h1 class="text-xl font-bold text-black/80">
            {{ isTrashView ? 'Trash Users' : 'Users Management' }}
          </h1>
          <p class="text-xs text-black/80 mt-0.5">{{ isTrashView ? 'Review deleted Users' : 'Review and manage all users' }}</p>
        </div>
      </div>

      <div class="flex items-center gap-2 self-start sm:self-auto">
        <button
          @click="handleRefresh"
          :disabled="userAdminStore.loading"
          class="inline-flex items-center gap-1.5 bg-white/50 hover:bg-white/20 text-black/80 text-xs px-3 py-2 rounded-md font-medium shadow-sm transition cursor-pointer disabled:opacity-50"
        >
          <i class="ri-refresh-line text-sm leading-none" :class="{ 'animate-spin': userAdminStore.loading }"></i>
          <span>Refresh</span>
        </button>

        <div class="inline-flex rounded-md bg-white/50 p-1 border shadow-sm border-slate-300/40">
          <button
            @click="isTrashView = false; currentPage = 1; loadUsers()"
            :class="[
              'px-3 py-1 text-xs font-medium rounded-sm transition flex items-center gap-1.5 cursor-pointer',
              !isTrashView ? 'bg-white text-black/80 shadow-sm' : 'text-black/80'
            ]"
          >
            <i class="ri-list-check"></i>
            <span>Active List</span>
          </button>

          <button
            @click="isTrashView = true; currentPage = 1; loadUsers()"
            :class="[
              'px-3 py-1 text-xs font-medium rounded-sm transition cursor-pointer flex items-center gap-1.5',
              isTrashView ? 'bg-red-700/80 text-white shadow-sm' : 'text-black/80 hover:text-red-600'
            ]"
          >
            <i class="ri-delete-bin-line"></i>
            <span>Trash Bin</span>
          </button>
        </div>
      </div>
    </div>

    <RestoreConfirmModel 
      title="Restore User"
      :item-name="selectedUser?.name"
      :is-open="isRestoreModalOpeon"
      :loading="userAdminStore.loading"
      @close="isRestoreModalOpeon = false"
      @confirm="handleConfirmRestore"
    />
    <DeleteConfirmModal 
      :is-open="isDeleteModalOpen || isDeletePermanentModalOpen"
      :item-name="userToDelete?.name"
      :delete-loading="userAdminStore.deleteUserLoading"
      :description="isDeleteModalOpen ? 'This action can be restored from the trash archive.' : 'This action cannot be restored.'"
      @close="isDeleteModalOpen = false, isDeletePermanentModalOpen = false"
      button="Delete User"
      @confirm="isDeleteModalOpen ? handleConfirmDelete() : handlePermanentDelete()"
    />
    <userViewModel
      :is-open="isUserDetailsOpen"
      :user="userAdminStore.selectedUser"
      :loading="userAdminStore.userDetailLoading"
      :promote-loading="userAdminStore.promoteUserLoading"
      :error="userAdminStore.error"
      @close="isUserDetailsOpen = false"
      @promote="handlePromoteUser"
    />

    <!-- 1. Stats Cards Component -->
    <userStatusCards :stats="userAdminStore.userStatus" :is-loading="userAdminStore.statusCardLoading"/>

    <!-- 2. Filter Bar Component -->
    <userFilterBar
      v-model:selected-users-filter="selectedUsersFilter"
      v-model:search-input="searchInput"
      :order-status-option="userStatusOptions"
      :search-disabled="searchDisable"
      @search="handleSearch"
    />

    <!-- 3. Customer List Table Component -->
    <div class="flex flex-col flex-1 min-h-0 bg-[#cdd0d5]/30 dark:bg-[#cdd0d5]/70 rounded-lg shadow-2xs overflow-hidden border border-slate-200/50">
      <!-- Added ref="tableContainerRef" here -->
      <div ref="tableContainerRef" class="flex-1 overflow-y-auto min-h-0">
        <userListTable
          :customers="userAdminStore.users"
          :loading="userAdminStore.loading"
          @status-change="handleStatusChange"
          @view="handleOpenUserDetails"
          @delete="handleOpenDeleteModal"
          @permanent-delete="handleOpenDeletePermanentModal"
          @restore="handleOpenRestoreModal"
          :is-trash-view="isTrashView"
        />
      </div>
      <userPagination 
        :current-page="currentPage"
        :pagination="userAdminStore.pagination"
        :loading="userAdminStore.loading"
        class="shrink-0"
        @prev="goToPreviousPage"
        @next="goToNextPage"
      />
    </div>
  </div>
</template>
