<template>
  <v-dialog v-model="dialog" max-width="480">
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-card>
        <v-card-title primary-title>
          <span class="title" v-text="title" />
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" class="py-0">
              <v-select
                v-model="formInputs.field"
                :items="fields"
                label="Field"
                dense
                class="pt-3"
              />
            </v-col>
            <v-col cols="12" class="py-0">
              <v-select
                v-model="formInputs.condition"
                :items="conditions"
                label="Condition"
                dense
                class="pt-3"
              />
            </v-col>
            <v-col cols="12" class="py-0">
              <v-text-field
                v-model="formInputs.value"
                :rules="valueRules"
                label="value"
                placeholder="Text or Pattern"
                required
                autofocus
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click.native="onClickClose">Cancel</v-btn>
          <v-btn color="primary" text @click.native="onClickSave">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch, Ref } from 'vue-property-decorator'
import { VForm } from 'vuetify/lib'

@Component
export default class RuleDialog extends Vue {
  @Prop({ type: Boolean, required: true }) readonly value!: boolean
  @Prop({ type: Object, default: () => ({}) }) readonly inputs!: object
  @Prop({ type: String, default: 'New Rule' }) readonly title!: string
  @Ref() readonly form!: typeof VForm

  fields = [
    { text: 'Author', value: 'author' },
    { text: 'Message', value: 'message' }
  ]
  conditions = [
    { text: 'Contains', value: 'contains' },
    { text: 'Matches Regular Expression', value: 'matches_regular_expression' }
  ]
  valueRules = [(v: string) => !!v || 'Value is required']
  valid = false
  dialog = false
  formInputs = {}

  @Watch('value')
  onValueChanged(value: boolean) {
    this.dialog = value
    if (value) {
      this.formInputs = {
        field: 'message',
        condition: 'contains',
        ...this.inputs
      }
    }
  }
  @Watch('dialog')
  onDialogChanged(value: boolean) {
    if (!value) {
      this.$emit('update:inputs', null)
    }
    this.$emit('input', value)
  }

  onClickClose() {
    this.$emit('update:inputs', null)
    this.$emit('input', false)
  }
  onClickSave() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(this.form as any).validate()) {
      return
    }
    this.$emit('update:inputs', { ...this.formInputs })
    this.$emit('input', false)
  }
}
</script>
