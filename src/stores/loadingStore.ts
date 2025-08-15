import { defineStore } from 'pinia'

export const useLoadingStore = defineStore('globalLoading', {
  state: () => ({
    active: false as boolean,
    message: 'Loading...' as string,
    _startedAt: 0,
    _minMs: 3000,
    _timer: null as number | null,
  }),
  actions: {
    show(msg?: string) {
      if (this._timer) {
        clearTimeout(this._timer)
        this._timer = null
      }
      this.message = msg ?? 'Loading...'
      this.active = true
      this._startedAt = Date.now()
    },
    hide() {
      const elapsed = Date.now() - this._startedAt
      const wait = Math.max(0, this._minMs - elapsed)
      if (wait <= 0) {
        this.active = false
        return
      }
      this._timer = window.setTimeout(() => {
        this.active = false
        this._timer = null
      }, wait) as unknown as number
    },
    setMinMs(ms: number) {
      this._minMs = ms
    },
  },
})
