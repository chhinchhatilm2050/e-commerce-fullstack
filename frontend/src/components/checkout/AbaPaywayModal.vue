<script setup lang="ts">
  import { ref, computed, watch, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useOrderStore } from '@/stores/orderStore'; // Adjust path as needed
  import type { IPaywayData } from '@/types/iorder';

  const props = defineProps<{
    isOpen: boolean;
    paywayData: IPaywayData | null;
  }>();

  const emit = defineEmits(['close', 'success']);
  const orderStore = useOrderStore();
  const router = useRouter();

  const qrResponse = ref<{ qrImage?: string; abapay_deeplink?: string } | null>(null);

  // paywayData.amount comes from the backend as a fixed 2-decimal string
  // (e.g. "37162.92"); format it with thousands separators for display.
  const formattedAmount = computed(() => {
    const raw = props.paywayData?.amount;
    if (!raw) return '0.00';
    const num = Number(raw);
    return Number.isNaN(num)
      ? raw
      : num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  });

  // 'idle' -> waiting for user to tap "Open KHQR QR Code"
  // 'polling' -> QR shown, waiting for the user to pay
  // 'failed' -> PayWay confirmed failure, or polling timed out
  const paymentState = ref<'idle' | 'polling' | 'failed'>('idle');
  const errorMessage = ref<string | null>(null);

  let pollIntervalId: ReturnType<typeof setInterval> | null = null;
  let pollTimeoutId: ReturnType<typeof setTimeout> | null = null;
  // Tracked so it can be cancelled if the modal closes/reopens before it fires -
  // otherwise a stray timer from an earlier attempt could redirect later using
  // an old tran_id.
  let redirectTimeoutId: ReturnType<typeof setTimeout> | null = null;

  const POLL_INTERVAL_MS = 3000; // check every 3s
  const POLL_TIMEOUT_MS = 5 * 60 * 1000; // give up after 5 minutes
  const REDIRECT_DELAY_MS = 3000; // wait this long after approval before closing + redirecting

  const stopPolling = () => {
    if (pollIntervalId) {
      clearInterval(pollIntervalId);
      pollIntervalId = null;
    }
    if (pollTimeoutId) {
      clearTimeout(pollTimeoutId);
      pollTimeoutId = null;
    }
    if (redirectTimeoutId) {
      clearTimeout(redirectTimeoutId);
      redirectTimeoutId = null;
    }
  };

  const startPolling = (tranId: string) => {
    stopPolling(); // guard against double-starts (also clears any stray redirect timer)
    paymentState.value = 'polling';

    pollIntervalId = setInterval(async () => {
      try {
        const res = await orderStore.checkStatus(tranId);
        const status = res?.status;

        if (status === 'APPROVED') {
          stopPolling();
          redirectTimeoutId = setTimeout(() => {
            redirectTimeoutId = null;
            emit('success', res?.order ?? { tran_id: tranId });
            emit('close');
            router.push({ path: '/order-success', query: { tran_id: tranId } });
          }, REDIRECT_DELAY_MS);
        } else if (status === 'FAILED') {
          stopPolling();
          paymentState.value = 'failed';
          errorMessage.value = 'Payment failed or was declined. Please try again.';
        }
        // 'PENDING' -> keep polling, do nothing.
      } catch  {
        // Network hiccup on a single poll shouldn't kill the whole flow;
        // just let the next interval tick try again.
      }
    }, POLL_INTERVAL_MS);

    pollTimeoutId = setTimeout(() => {
      if (paymentState.value === 'polling') {
        stopPolling();
        paymentState.value = 'failed';
        errorMessage.value = 'We couldn\'t confirm your payment in time. If you already paid, check your order history in a moment.';
      }
    }, POLL_TIMEOUT_MS);
  };

  const generateQrCode = async () => {
    if (!props.paywayData) return;

    errorMessage.value = null;

    try {
      const response = await orderStore.createPaywayPurchase(props.paywayData);
      const data = response?.data;

      if (data?.status?.code === '00') {
        qrResponse.value = {
          qrImage: data.qrImage,
          abapay_deeplink: data.abapay_deeplink,
        };
        startPolling(props.paywayData.tran_id);
      } else {
        errorMessage.value = data?.status?.message || 'Failed to generate KHQR code.';
      }
    } catch {
      errorMessage.value = 'Failed to generate KHQR code. Please try again.';
    }
  };

  const resetState = () => {
    stopPolling(); // also clears redirectTimeoutId now
    qrResponse.value = null;
    paymentState.value = 'idle';
    errorMessage.value = null;
  };

  // Reset everything whenever the modal is closed, so reopening it (e.g. for
  // a new order) doesn't show stale QR codes or success states, and can't
  // leave a stray redirect timer running from the previous attempt.
  watch(() => props.isOpen, (open) => {
    if (!open) {
      resetState();
    }
  });

  onUnmounted(() => {
    stopPolling();
  });
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="bg-white rounded-lg p-8 max-w-sm w-full relative shadow-xl text-center space-y-4 animate-slide-up">
      <button @click="emit('close')" class="absolute top-4 right-4 h-6 w-6 bg-black/30 rounded-full text-white cursor-pointer">
       <i class="ri-close-fill"></i>
      </button>

      <!-- Failed / timed out state -->
      <div v-if="paymentState === 'failed'" class="flex flex-col items-center space-y-3 py-4">
        <div class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <svg class="w-9 h-9 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h3 class="text-lg font-bold text-gray-800">Payment Not Completed</h3>
        <p class="text-xs text-gray-500">{{ errorMessage }}</p>
        <button
          @click="resetState"
          class="w-full py-2 bg-gray-800 text-white font-bold rounded-md hover:bg-gray-900 transition-colors text-sm"
        >
          Try Again
        </button>
      </div>

      <!-- QR shown, waiting for payment -->
      <template v-else >
        <h3 class="text-xl font-bold text-gray-800 animate-slide-up">Scan to Pay via ABA Mobile</h3>

        <div v-if="qrResponse?.qrImage" class="flex flex-col items-center animate-slide-up">
          
          <img :src="qrResponse.qrImage" alt="KHQR Code" class="w-64 h-64 object-contain rounded-md border animate-slide-up" />
          
          <!-- <p class="text-sm text-gray-500 animate-slide-up">Amount to pay</p> -->
          <p class="text-2xl font-bold text-gray-900 animate-slide-up mt-2">${{ formattedAmount }}</p>
          <a
            v-if="qrResponse?.abapay_deeplink"
            :href="qrResponse.abapay_deeplink"
            class="w-full py-2 mt-2 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 transition-colors inline-block text-sm text-center animate-slide-up"
          >
            Open in ABA Mobile App
          </a>

          <p v-if="paymentState === 'polling'" class="text-xs text-gray-400 flex items-center animate-slide-up gap-1.5 mt-2">
            <span class="inline-block w-2 h-2 rounded-full bg-amber-400 animate-slide-up"></span>
            Waiting for payment confirmation...
          </p>
        </div>

        <div v-else class="space-y-4">
          <p class="text-2xl font-bold text-black animate-slide-up">${{ formattedAmount }}</p>
          <p class="text-xs text-black/70 animate-slide-up">
            Click below to generate your official KHQR code and complete your payment.
          </p>
          <p v-if="errorMessage" class="text-xs text-red-600">{{ errorMessage }}</p>
          <button
            @click="generateQrCode"
            :disabled="orderStore.loading"
            class="w-full subCategory-button dark:bg-black/70 disabled:opacity-50 animate-slide-up"
          >
            {{ orderStore.loading ? 'Generating KHQR...' : 'Open KHQR QR Code' }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>
