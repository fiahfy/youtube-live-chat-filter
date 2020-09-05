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
        v-text="item.active ? 'active' : 'inactive'"
      />
    </td>
  </tr>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import { Rule } from '~/models'

type Props = {
  item: Rule
  isSelected: boolean
  select: (v: boolean) => void
}

export default defineComponent({
  props: {
    item: {
      type: Object,
      required: true,
    },
    isSelected: {
      type: Boolean,
      required: true,
    },
    select: {
      type: Function,
      required: true,
    },
  },
  setup(props: Props) {
    const classes = computed(() => {
      return props.isSelected ? 'v-data-table__selected' : ''
    })
    const condition = computed(() => {
      return {
        contains: 'Contains',
        equals: 'Equals',
        matches_regular_expression: 'Matches Regular Expression',
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

    return {
      classes,
      condition,
      actionIcon,
      handleSelect,
    }
  },
})
</script>

<style lang="scss" scoped>
.value {
  max-width: 150px;
  min-width: 96px;
}
.action {
  width: 90px;
}
</style>
