<script setup lang="ts">
import { computed, reactive } from 'vue'
import RuleDialog from '~/components/RuleDialog.vue'
import RuleTableRow from '~/components/RuleTableRow.vue'
import RuleTableToolbar from '~/components/RuleTableToolbar.vue'
import { Rule } from '~/models'
import { useStore } from '~/store'

const store = useStore()

const headers = [
  { text: 'Field', value: 'field' },
  { text: 'Condition', value: 'condition' },
  { text: 'Value', value: 'value' },
  { text: 'Action', value: 'action' },
  { text: 'Status', value: 'active' },
]

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
  return store.state.settings.rules.concat().reverse()
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
  store.commit('settings/setRule', {
    ...item,
    id: item.id,
  })
}

const handleClickDelete = (item: Rule) => {
  state.dialog = false
  store.commit('settings/removeRule', { id: item.id })
}
</script>

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
    <template #top>
      <RuleTableToolbar
        :selected.sync="state.selected"
        :query.sync="state.search"
      />
      <RuleDialog
        v-model="state.dialog"
        editing
        :form="state.form"
        @click-cancel="handleClickCancel"
        @click-save="handleClickSave"
        @click-delete="handleClickDelete"
      />
    </template>
    <template #item="props">
      <RuleTableRow
        v-bind="props"
        @click.native="() => handleClickRow(props.item)"
      />
    </template>
  </v-data-table>
</template>

<style lang="scss" scoped>
.rule-table-row {
  cursor: pointer;
}
</style>
