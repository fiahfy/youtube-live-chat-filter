<template>
  <v-data-table
    v-model="state.selected"
    :search="state.search"
    :headers="headers"
    :items="rules"
    :mobile-breakpoint="0"
    :items-per-page="-1"
    class="rule-table"
    hide-default-footer
    show-select
  >
    <template v-slot:top>
      <rule-table-toolbar
        :selected.sync="state.selected"
        :query.sync="state.search"
      />
      <rule-dialog
        v-model="state.dialog"
        editing
        :form="state.form"
        @click:cancel="handleClickCancel"
        @click:save="handleClickSave"
        @click:delete="handleClickDelete"
      />
    </template>
    <template v-slot:item="props">
      <rule-table-row
        v-bind="props"
        @click.native="() => handleClickRow(props.item)"
      />
    </template>
  </v-data-table>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import RuleDialog from '~/components/RuleDialog.vue'
import RuleTableRow from '~/components/RuleTableRow.vue'
import RuleTableToolbar from '~/components/RuleTableToolbar.vue'
import { Rule } from '~/models'
import { settingsStore } from '~/store'

const headers = [
  { text: 'Field', value: 'field' },
  { text: 'Condition', value: 'condition' },
  { text: 'Value', value: 'value' },
  { text: 'Action', value: 'action' },
  { text: 'Status', value: 'active' },
]

export default defineComponent({
  components: {
    RuleDialog,
    RuleTableRow,
    RuleTableToolbar,
  },
  setup() {
    const state = reactive<{
      selected: Rule[]
      search: string
      dialog: boolean
      form?: Partial<Rule>
    }>({
      selected: [],
      search: '',
      dialog: false,
      form: undefined,
    })

    const rules = computed(() => {
      return settingsStore.rules.concat().reverse()
    })

    const handleClickRow = (item: Rule) => {
      state.form = item
      state.dialog = true
    }
    const handleClickCancel = () => {
      state.dialog = false
    }
    const handleClickSave = (item: Rule) => {
      state.dialog = false
      settingsStore.setRule({
        ...item,
        id: item.id,
      })
    }
    const handleClickDelete = (item: Rule) => {
      state.dialog = false
      settingsStore.removeRule({ id: item.id })
    }

    return {
      headers,
      state,
      rules,
      handleClickRow,
      handleClickCancel,
      handleClickSave,
      handleClickDelete,
    }
  },
})
</script>

<style lang="scss" scoped>
.rule-table-row {
  cursor: pointer;
}
</style>
