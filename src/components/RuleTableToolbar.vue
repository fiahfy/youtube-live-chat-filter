<template>
  <v-toolbar class="rule-table-toolbar" flat color="transparent">
    <v-spacer />
    <v-btn color="primary" depressed @click="handleClickNew">
      New Rule
    </v-btn>
    <rule-dialog
      v-model="state.dialog"
      @click:cancel="handleClickCancel"
      @click:save="handleClickSave"
    />
  </v-toolbar>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import RuleDialog from '~/components/RuleDialog.vue'
import { Rule } from '~/models'
import { settingsStore } from '~/store'

export default defineComponent({
  components: {
    RuleDialog,
  },
  setup() {
    const state = reactive<{
      dialog: boolean
    }>({
      dialog: false,
    })

    const handleClickNew = () => {
      state.dialog = true
    }
    const handleClickCancel = () => {
      state.dialog = false
    }
    const handleClickSave = (item: Rule) => {
      state.dialog = false
      settingsStore.addRule(item)
    }

    return {
      state,
      handleClickNew,
      handleClickCancel,
      handleClickSave,
    }
  },
})
</script>
