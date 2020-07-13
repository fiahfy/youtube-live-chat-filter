<template>
  <tr>
    <td class="caption text-capitalize" v-text="item.field" />
    <td class="caption text-capitalize" v-text="condition" />
    <td
      class="caption text-truncate value"
      :title="item.value"
      v-text="item.value"
    />
    <td class="caption action">
      <v-icon>{{ actionIcon }}</v-icon>
    </td>
    <td class="text-center">
      <v-chip
        :color="item.active ? 'green' : 'grey'"
        outlined
        x-small
        v-text="item.active ? 'active' : 'inactive'"
      />
    </td>
    <td class="text-no-wrap">
      <v-btn class="mr-1" icon @click="handleClickEdit">
        <v-icon color="teal">mdi-pencil</v-icon>
      </v-btn>
      <v-btn icon @click="handleClickDelete">
        <v-icon color="pink">mdi-delete</v-icon>
      </v-btn>
    </td>
    <rule-dialog
      v-model="state.dialog"
      :inputs.sync="state.form"
      title="Edit Rule"
    />
  </tr>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  watch,
} from '@vue/composition-api'
import RuleDialog from '~/components/RuleDialog.vue'
import Rule from '~/models/rule'
import { settingsStore } from '~/store'

type Props = {
  item: Rule
}

export default defineComponent({
  components: {
    RuleDialog,
  },
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  setup(props: Props) {
    const state = reactive<{
      dialog: boolean
      form?: Partial<Rule>
    }>({
      dialog: false,
      form: undefined,
    })

    const condition = computed(() => {
      return {
        contains: 'Contains',
        matches_regular_expression: 'Matches Regular Expression',
      }[props.item.condition]
    })
    const actionIcon = computed(() => {
      return {
        mask_message: 'mdi-marker',
        hide_completely: 'mdi-eye-off',
      }[props.item.action]
    })

    const handleClickEdit = () => {
      state.form = props.item
      state.dialog = true
    }
    const handleClickDelete = () => {
      settingsStore.removeRule({ id: props.item.id })
    }

    watch(
      () => state.dialog,
      (dialog) => {
        if (!dialog && state.form) {
          settingsStore.setRule({
            ...state.form,
            id: props.item.id,
          })
        }
      }
    )

    return {
      state,
      condition,
      actionIcon,
      handleClickEdit,
      handleClickDelete,
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
