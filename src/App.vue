<script setup lang="ts">
import { stringifyLabels, useAccountsStore } from '@/stores/accounts'
import { onMounted } from 'vue'

const store = useAccountsStore()

onMounted(() => {
  if (store.accounts.length === 0) {
    store.addAccount()
  }
})
</script>

<template>
  <v-app>
    <v-container class="pa-6">
      <v-card class="mb-6 bg-primary text-white pa-4 rounded-lg elevation-2">
        <div class="d-flex align-center">
          <h1 class="text-h5 font-weight-bold mr-4">Учетные записи</h1>
          <v-btn
            icon
            size="40"
            color="white"
            variant="outlined"
            @click="store.addAccount()"
            aria-label="Добавить запись"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </div>
      </v-card>

      <v-alert color="info" variant="tonal" class="mb-6" icon="mdi-lightbulb-on">
        Поле "Метка" — необязательное. Вводите метки через точку с запятой (;). Например:
        <code>работа; почта</code>
      </v-alert>

      <v-row class="font-weight-bold text-subtitle-1 mb-3">
        <v-col cols="3">Метка</v-col>
        <v-col cols="2">Тип записи</v-col>
        <v-col cols="3">Логин</v-col>
        <v-col cols="3">Пароль</v-col>
        <v-col cols="1"></v-col>
      </v-row>

      <div v-for="account in store.accounts" :key="account.id" class="mb-3">
        <v-row class="align-center bg-grey-lighten5 rounded pa-2" style="flex: 1; min-height: 72px">
          <v-col cols="3">
            <v-text-field
              v-model="account.labelRaw"
              placeholder="метка1; метка2"
              variant="outlined"
              density="compact"
              :hint="stringifyLabels(account.label)"
              persistent-hint
              @blur="store.updateLabelRaw(account.id, account.labelRaw)"
            ></v-text-field>
          </v-col>

          <v-col cols="2">
            <v-select
              v-model="account.type"
              :items="['Локальная', 'LDAP']"
              variant="outlined"
              density="compact"
              @update:modelValue="store.updateType(account.id, $event)"
            ></v-select>
          </v-col>

          <v-col :cols="account.type === 'Локальная' ? 3 : 6">
            <v-text-field
              v-model="account.login"
              variant="outlined"
              density="compact"
              :error-messages="account.errors.login"
              @blur="store.updateLogin(account.id, account.login)"
            ></v-text-field>
          </v-col>

          <v-col v-if="account.type === 'Локальная'" cols="3">
            <v-text-field
              v-model="account.password"
              :type="account.passwordVisible ? 'text' : 'password'"
              variant="outlined"
              density="compact"
              :error-messages="account.errors.password"
              :append-inner-icon="account.passwordVisible ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append-inner="store.togglePasswordVisibility(account.id)"
              @blur="store.updatePassword(account.id, account.password ?? '')"
              placeholder="Введите пароль"
            ></v-text-field>
          </v-col>

          <v-col cols="1" class="d-flex justify-center align-start" style="min-height: 72px">
            <v-btn
              v-if="store.accounts.length > 1"
              icon
              size="32"
              color="error"
              variant="text"
              @click="store.removeAccount(account.id)"
              aria-label="Удалить запись"
            >
              <v-icon size="32">mdi-delete</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </div>

      <div class="text-caption text-grey mt-6 text-center">
        Данные сохраняются автоматически. Обновите страницу — всё останется.
      </div>
    </v-container>
  </v-app>
</template>

<style scoped>
:deep(.v-field--error) {
  animation: shake 0.3s ease-in-out;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-4px);
  }
  75% {
    transform: translateX(4px);
  }
}

code {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}
</style>
