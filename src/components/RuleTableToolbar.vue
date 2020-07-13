<template>
  <v-toolbar flat color="transparent">
    <v-spacer />
    <v-btn color="primary" depressed @click="handleClickNew">
      New Rule
    </v-btn>
    <rule-dialog v-model="state.dialog" :inputs.sync="state.form" />
  </v-toolbar>
</template>

<script lang="ts">
import { defineComponent, reactive, watch } from '@vue/composition-api'
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
      form?: Partial<Rule>
    }>({
      dialog: false,
      form: undefined,
    })

    const handleClickNew = () => {
      state.form = undefined
      state.dialog = true
    }

    watch(
      () => state.dialog,
      (dialog) => {
        if (!dialog && state.form) {
          settingsStore.addRule({ ...state.form })
        }
      }
    )

    return {
      state,
      handleClickNew,
    }
  },
})
</script>
