<template>
  <v-card class="pa-5" flat>
    <v-select
      v-model="filterAction"
      :items="filterActions"
      label="Filter Action"
      dense
      class="pt-3"
    />
  </v-card>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { settingsStore } from '~/store'

@Component
export default class RuleTabItem extends Vue {
  filterActions = [
    { text: 'Hide completely', value: 'hide_completely' },
    { text: 'Mask Message', value: 'mask_message' }
  ]

  get filterAction() {
    return settingsStore.filterAction
  }
  set filterAction(value) {
    settingsStore.setFilterAction({ filterAction: value })
  }
}
</script>
