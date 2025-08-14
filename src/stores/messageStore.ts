// src/stores/messageStore.ts
import { defineStore } from 'pinia'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export const useMessageStore = defineStore('message', {
  state: () => ({
    message: '' as string,
    type: 'success' as ToastType,
    visible: false as boolean,
    _timer: null as ReturnType<typeof setTimeout> | null,
  }),
  actions: {
    // เหมือนที่คุณอยากได้: updateMessages/resetMessages
    updateMessages(msg: string, type: ToastType = 'success', duration = 3000) {
      this.show(msg, type, duration)
    },
    resetMessages() {
      this.hide()
    },

    // เมธอดหลักสำหรับ toast
    show(msg: string, type: ToastType = 'success', duration = 2500) {
      this.message = msg
      this.type = type
      this.visible = true
      if (this._timer) clearTimeout(this._timer)
      this._timer = setTimeout(() => {
        this.visible = false
        this.message = ''
      }, duration)
    },
    hide() {
      if (this._timer) clearTimeout(this._timer)
      this.visible = false
      this.message = ''
      this._timer = null
    },
  },
})
