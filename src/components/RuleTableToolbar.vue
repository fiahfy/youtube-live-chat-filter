<template>
  <v-toolbar class="rule-table-toolbar" flat color="transparent">
    <v-text-field
      :value="query"
      class="mr-5"
      placeholder="Search"
      prepend-inner-icon="mdi-magnify"
      hide-details
      clearable
      @input="handleInputQuery"
    />
    <v-btn
      v-if="selected.length"
      color="error"
      depressed
      @click="handleClickDelete"
    >
      Delete {{ selected.length }} Rule(s)
    </v-btn>
    <v-btn v-else color="primary" depressed @click="handleClickNew">
      New Rule
    </v-btn>
    <rule-dialog
      v-model="state.dialog"
      @click-cancel="handleClickCancel"
      @click-save="handleClickSave"
    />
    <v-dialog v-model="state.confirmDialog" max-width="360">
      <v-card>
        <v-card-title primary-title>
          <span class="title">Delete {{ selected.length }} rule(s)?</span>
        </v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="handleClickCancelConfirm">Cancel</v-btn>
          <v-btn color="error" text @click="handleClickSubmit">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-toolbar>
</template>

<script lang="ts">
import { defineComponent, reactive, SetupContext } from '@vue/composition-api'
import RuleDialog from '~/components/RuleDialog.vue'
import { Rule } from '~/models'
import { settingsStore } from '~/store'

type Props = {
  selected: Rule[]
  query: string
}

export default defineComponent({
  components: {
    RuleDialog,
  },
  props: {
    selected: {
      type: Array,
      default: () => [],
    },
    query: {
      type: String,
      default: '',
    },
  },
  setup(props: Props, context: SetupContext) {
    const state = reactive<{
      dialog: boolean
      confirmDialog: boolean
    }>({
      dialog: false,
      confirmDialog: false,
    })

    const handleInputQuery = (value: string) => {
      context.emit('update:query', value)
      context.emit('update:selected', [])
    }
    const handleClickDelete = () => {
      state.confirmDialog = true
    }
    const handleClickCancelConfirm = () => {
      state.confirmDialog = false
    }
    const handleClickSubmit = () => {
      state.confirmDialog = false
      settingsStore.removeRules({ ids: props.selected.map((item) => item.id) })
      context.emit('update:selected', [])
    }
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
      handleInputQuery,
      handleClickDelete,
      handleClickCancelConfirm,
      handleClickSubmit,
      handleClickNew,
      handleClickCancel,
      handleClickSave,
    }
  },
})
</script>
