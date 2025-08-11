import type { MessageState } from '@/types';
import { defineStore } from 'pinia';
export const useMessageStore = defineStore('message', {
    state: (): MessageState => ({
        message: '',
    }),
    actions:{
        updateMessages(messages: string): void {
            this.message = messages;
        },
        resetMessages(): void {
            this.message = '';
        }
    }
    });