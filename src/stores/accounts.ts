import { defineStore } from 'pinia'

export interface LabelItem {
  text: string
}

export interface Account {
  id: number
  label: LabelItem[]
  labelRaw: string
  type: 'Локальная' | 'LDAP'
  login: string
  password: string | null
  passwordVisible: boolean
  errors: {
    login: string | null
    password: string | null
  }
}

const getDefaultState = (): { accounts: Account[] } => ({ accounts: [] })

const loadState = (): { accounts: Account[] } => {
  try {
    const saved = localStorage.getItem('accounts-store')
    if (saved) {
      const parsed = JSON.parse(saved)
      parsed.accounts.forEach((acc: any) => {
        acc.label = parseLabels(acc.labelRaw || '')
        acc.errors = acc.errors || { login: null, password: null }
        acc.passwordVisible = Boolean(acc.passwordVisible)
      })
      return parsed
    }
  } catch (e) {
    console.warn('Не удалось загрузить данные', e)
  }
  return getDefaultState()
}

const saveState = (state: { accounts: Account[] }) => {
  state.accounts.forEach((acc) => {
    acc.labelRaw = stringifyLabels(acc.label)
  })
  localStorage.setItem('accounts-store', JSON.stringify(state))
}

export const parseLabels = (raw: string): LabelItem[] => {
  if (!raw) return []
  return raw
    .split(';')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
    .map((text) => ({ text }))
}

export const stringifyLabels = (labels: LabelItem[]): string => {
  return labels.map((l) => l.text).join('; ')
}

export const useAccountsStore = defineStore('accounts', {
  state: () => loadState(),

  actions: {
    addAccount() {
      const newAccount: Account = {
        id: Date.now(),
        label: [],
        labelRaw: '',
        type: 'Локальная',
        login: '',
        password: null,
        passwordVisible: false,
        errors: { login: null, password: null },
      }
      this.accounts.push(newAccount)
      saveState(this.$state)
    },

    removeAccount(id: number) {
      this.accounts = this.accounts.filter((acc) => acc.id !== id)
      saveState(this.$state)
    },

    updateLogin(id: number, value: string) {
      const acc = this.accounts.find((a) => a.id === id)
      if (!acc) return

      acc.login = value.trim()
      this.validateAccount(acc)
      saveState(this.$state)
    },

    updatePassword(id: number, value: string) {
      const acc = this.accounts.find((a) => a.id === id)
      if (!acc || acc.type !== 'Локальная') return

      acc.password = value.trim() || null
      this.validateAccount(acc)
      saveState(this.$state)
    },

    updateType(id: number, value: 'Локальная' | 'LDAP') {
      const acc = this.accounts.find((a) => a.id === id)
      if (!acc) return

      const wasLocal = acc.type === 'Локальная'
      acc.type = value

      if (value === 'LDAP') {
        acc.password = null
      } else if (wasLocal && !acc.password) {
        acc.password = ''
      }

      this.validateAccount(acc)
      saveState(this.$state)
    },

    updateLabelRaw(id: number, value: string) {
      const acc = this.accounts.find((a) => a.id === id)
      if (!acc) return

      acc.label = parseLabels(value)
      saveState(this.$state)
    },

    togglePasswordVisibility(id: number) {
      const acc = this.accounts.find((a) => a.id === id)
      if (acc) {
        acc.passwordVisible = !acc.passwordVisible
        saveState(this.$state)
      }
    },

    validateAccount(acc: Account) {
      acc.errors.login =
        acc.login.length === 0
          ? 'Логин обязателен'
          : acc.login.length > 100
            ? 'Максимум 100 символов'
            : null

      if (acc.type === 'Локальная') {
        acc.errors.password =
          acc.password === null || acc.password.length === 0
            ? 'Пароль обязателен'
            : acc.password.length > 100
              ? 'Максимум 100 символов'
              : null
      } else {
        acc.errors.password = null
      }
    },
  },
})
