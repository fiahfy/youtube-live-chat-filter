<template>
  <v-dialog v-model="state.dialog" max-width="480">
    <v-form ref="form" v-model="state.valid" lazy-validation>
      <v-card>
        <v-card-title primary-title>
          <span class="title" v-text="title" />
        </v-card-title>
        <v-card-text>
          <v-select
            v-model="state.formInputs.field"
            :items="fields"
            label="Field"
            dense
            class="pt-3"
          />
          <v-select
            v-model="state.formInputs.condition"
            :items="conditions"
            label="Condition"
            dense
            class="pt-3"
          />
          <v-text-field
            v-model="state.formInputs.value"
            :rules="valueRules"
            label="Value"
            :placeholder="placeholder"
            required
            autofocus
          />
          <v-select
            v-model="state.formInputs.action"
            :items="actions"
            label="Action"
            dense
            class="pt-3"
          />
          <v-switch
            v-model="state.formInputs.active"
            :label="state.formInputs.active ? 'Active' : 'Inactive'"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click.native="handleClickClose">Cancel</v-btn>
          <v-btn color="primary" text @click.native="handleClickSave">
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  ref,
  reactive,
  watch,
  SetupContext,
} from '@vue/composition-api'
import { VForm } from 'vuetify/lib'
import Rule from '~/models/rule'

const fields = [
  { text: 'Author', value: 'author' },
  { text: 'Message', value: 'message' },
]
const conditions = [
  { text: 'Contains', value: 'contains' },
  { text: 'Matches Regular Expression', value: 'matches_regular_expression' },
]
const actions = [
  { text: 'Mask Message', value: 'mask_message' },
  { text: 'Hide Completely', value: 'hide_completely' },
]
const valueRules = [(v: string) => !!v || 'Value is required']

type Props = {
  value: boolean
  title: string
  inputs: Partial<Rule>
}

export default defineComponent({
  props: {
    value: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
      default: 'New Rule',
    },
    inputs: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props: Props, context: SetupContext) {
    const state = reactive<{
      valid: boolean
      dialog: boolean
      formInputs: Partial<Rule>
    }>({
      valid: false,
      dialog: false,
      formInputs: {},
    })

    const placeholder = computed(() =>
      state.formInputs.condition === 'contains' ? 'Text' : 'Pattern'
    )

    const form = ref<typeof VForm>()

    const handleClickClose = () => {
      context.emit('update:inputs', undefined)
      context.emit('input', false)
    }
    const handleClickSave = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!(form.value as any).validate()) {
        return
      }
      context.emit('update:inputs', { ...state.formInputs })
      context.emit('input', false)
    }

    watch(
      () => props.value,
      (value) => {
        state.dialog = value
        if (value) {
          state.formInputs = {
            active: true,
            field: 'message',
            condition: 'contains',
            action: 'mask_message',
            ...props.inputs,
          }
        }
      }
    )

    return {
      fields,
      conditions,
      actions,
      valueRules,
      state,
      placeholder,
      form,
      handleClickClose,
      handleClickSave,
    }
  },
})
</script>
