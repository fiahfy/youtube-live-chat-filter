<template>
  <v-dialog
    :value="value"
    class="rule-dialog"
    max-width="480"
    persistent
    @input="$emit('input', $event.target.value)"
  >
    <v-form ref="formRef" v-model="state.valid" lazy-validation>
      <v-card>
        <v-card-title primary-title>
          <span class="title" v-text="title" />
        </v-card-title>
        <v-card-text>
          <v-select
            v-model="state.form.field"
            :items="fields"
            label="Field"
            dense
            class="pt-3"
          />
          <v-select
            v-model="state.form.condition"
            :items="conditions"
            label="Condition"
            dense
            class="pt-3"
          />
          <v-text-field
            v-model="state.form.value"
            :rules="valueRules"
            :placeholder="placeholder"
            hint="To match an Emoji, specify `:emoji_code:`"
            label="Value"
            required
            autofocus
          />
          <v-select
            v-model="state.form.action"
            :items="actions"
            label="Action"
            dense
            class="pt-3"
          />
          <v-switch
            v-model="state.form.active"
            :label="state.form.active ? 'Active' : 'Inactive'"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click.native="handleClickCancel">Cancel</v-btn>
          <v-btn color="primary" text @click.native="handleClickSave">
            Save
          </v-btn>
          <v-btn
            v-if="editing"
            color="error"
            text
            @click.native="handleClickConfirm"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
    <v-dialog v-model="state.dialog" max-width="360">
      <v-card>
        <v-card-title primary-title>
          <span class="title">Delete this rule?</span>
        </v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="handleClickCancelConfirm">Cancel</v-btn>
          <v-btn color="error" text @click="handleClickSubmit">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
import { Rule } from '~/models'

const fields = [
  { text: 'Author', value: 'author' },
  { text: 'Message', value: 'message' },
]
const conditions = [
  { text: 'Contains', value: 'contains' },
  { text: 'Equals', value: 'equals' },
  { text: 'Matches Regular Expression', value: 'matches_regular_expression' },
  { text: 'Does Not Contain', value: 'does_not_contain' },
  { text: 'Does Not Equal', value: 'does_not_equal' },
  {
    text: 'Does Not Match Regular Expression',
    value: 'does_not_match_regular_expression',
  },
]
const actions = [
  { text: 'Mask Message', value: 'mask_message' },
  { text: 'Hide Completely', value: 'hide_completely' },
]
const valueRules = [(v: string) => !!v || 'Value is required']

type Props = {
  value: boolean
  editing: boolean
  form: Partial<Rule>
}

export default defineComponent({
  props: {
    value: {
      type: Boolean,
      required: true,
    },
    editing: {
      type: Boolean,
      default: false,
    },
    form: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props: Props, context: SetupContext) {
    const state = reactive<{
      dialog: boolean
      valid: boolean
      form: Partial<Rule>
    }>({
      dialog: false,
      valid: false,
      form: {},
    })

    const title = computed(() => {
      return props.editing ? 'Edit Rule' : 'New Rule'
    })
    const placeholder = computed(() =>
      state.form.condition === 'matches_regular_expression' ? 'Pattern' : 'Text'
    )

    const formRef = ref<typeof VForm>()

    const handleClickCancel = () => {
      context.emit('click-cancel')
    }
    const handleClickSave = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!(formRef.value as any).validate()) {
        return
      }
      context.emit('click-save', { ...state.form })
    }
    const handleClickConfirm = () => {
      state.dialog = true
    }
    const handleClickCancelConfirm = () => {
      state.dialog = false
    }
    const handleClickSubmit = () => {
      state.dialog = false
      context.emit('click-delete', { ...state.form })
    }

    watch(
      () => props.value,
      (value) => {
        if (value) {
          state.form = {
            active: true,
            field: 'message',
            condition: 'contains',
            action: 'hide_completely',
            ...props.form,
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
      title,
      placeholder,
      formRef,
      handleClickCancel,
      handleClickSave,
      handleClickConfirm,
      handleClickCancelConfirm,
      handleClickSubmit,
    }
  },
})
</script>
