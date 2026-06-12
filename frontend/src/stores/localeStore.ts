import { defineStore } from "pinia";
import { ref, watch, type Ref } from 'vue';
import i18n from "@/i18n/index.js";
import type { SupportedLocale } from "@/i18n/index.js";

export const useLocaleStore = defineStore('locale', () => {
    const locale = ref<SupportedLocale>(
        (localStorage.getItem('chhatstore_locale') as SupportedLocale) || 'en'
    );

    watch(locale, (newLocale) => {
        localStorage.setItem('chhatstore_locale', newLocale);
        (i18n.global.locale as unknown as Ref<SupportedLocale>).value = newLocale; 
    });

    const setLocale = (lang: SupportedLocale): void => {
        locale.value = lang;
    };

    return { locale, setLocale }
});