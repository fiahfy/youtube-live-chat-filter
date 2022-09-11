<script setup lang="ts">
import { computed } from 'vue'
import { Rule } from '~/models'

type Props = {
  item: Rule
  isSelected: boolean
  select: (v: boolean) => void
}

const props = defineProps<Props>()

const classes = computed(() => {
  return props.isSelected ? 'v-data-table__selected' : ''
})

const condition = computed(() => {
  return {
    contains: 'Contains',
    equals: 'Equals',
    matches_regular_expression: 'Matches Regular Expression',
    does_not_contain: 'Does Not Contain',
    does_not_equal: 'Does Not Equal',
    does_not_match_regular_expression: 'Does Not Match Regular Expression',
  }[props.item.condition]
})

const actionIcon = computed(() => {
  return {
    mask_message: 'mdi-marker',
    hide_completely: 'mdi-eye-off',
  }[props.item.action]
})

const handleSelect = (value: boolean) => {
  props.select(value)
}
</script>

<template>
  <tr class="rule-table-row" :class="classes">
    <td @click.stop>
      <v-simple-checkbox
        :value="isSelected"
        :ripple="false"
        @input="handleSelect"
      />
    </td>
    <td class="caption text-capitalize" v-text="item.field" />
    <td class="caption text-capitalize" v-text="condition" />
    <td
      class="caption text-truncate value"
      :title="item.value"
      v-text="item.value"
    />
    <td class="text-center caption action">
      <v-icon>{{ actionIcon }}</v-icon>
    </td>
    <td class="text-center">
      <v-chip
        :color="item.active ? 'green' : 'grey'"
        outlined
        x-small
        style="pointer-events: none"
        >{{ item.active ? 'active' : 'inactive' }}</v-chip
      >
    </td>
  </tr>
</template>

<style lang="scss" scoped>
.value {
  max-width: 150px;
  min-width: 96px;
}
.action {
  width: 90px;
}
</style>
