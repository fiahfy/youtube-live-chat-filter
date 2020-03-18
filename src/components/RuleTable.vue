<template>
  <v-data-table
    :headers="headers"
    :items="rules"
    :mobile-breakpoint="0"
    :items-per-page="-1"
    hide-default-footer
  >
    <rule-table-toolbar slot="top" />
    <rule-table-row
      slot="item"
      :key="props.item.id"
      slot-scope="props"
      :item="props.item"
    />
  </v-data-table>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { settingsStore } from '~/store'
import RuleTableRow from '~/components/RuleTableRow.vue'
import RuleTableToolbar from '~/components/RuleTableToolbar.vue'

@Component({
  components: {
    RuleTableRow,
    RuleTableToolbar
  }
})
export default class RuleTable extends Vue {
  headers = [
    { text: 'Field', value: 'field' },
    { text: 'Condition', value: 'condition' },
    { text: 'Value', value: 'value' },
    { text: 'Status', value: 'active' },
    { text: 'Actions', sortable: false }
  ]

  get rules() {
    return settingsStore.rules
  }
}
</script>
