<template>
  <v-data-table
    :headers="headers"
    :items="rules"
    :mobile-breakpoint="0"
    :items-per-page="-1"
    hide-default-footer
  >
    <template v-slot:top>
      <rule-table-toolbar />
    </template>
    <template v-slot:item="props">
      <rule-table-row :item="props.item" />
    </template>
  </v-data-table>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import RuleTableRow from '~/components/RuleTableRow.vue'
import RuleTableToolbar from '~/components/RuleTableToolbar.vue'
import { settingsStore } from '~/store'

const headers = [
  { text: 'Field', value: 'field' },
  { text: 'Condition', value: 'condition' },
  { text: 'Value', value: 'value' },
  { text: 'Action', value: 'action' },
  { text: 'Status', value: 'active' },
  { sortable: false },
]

export default defineComponent({
  components: {
    RuleTableRow,
    RuleTableToolbar,
  },
  setup() {
    const rules = computed(() => {
      return settingsStore.rules
    })

    return {
      headers,
      rules,
    }
  },
})
</script>
