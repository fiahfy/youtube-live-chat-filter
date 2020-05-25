<template>
  <tr>
    <td class="caption text-capitalize" v-text="item.field" />
    <td class="caption text-capitalize" v-text="condition" />
    <td class="caption text-truncate value" v-text="item.value" />
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
      <v-btn class="mr-1" icon @click="onClickEdit">
        <v-icon color="teal">mdi-pencil</v-icon>
      </v-btn>
      <v-btn icon @click="onClickDelete">
        <v-icon color="pink">mdi-delete</v-icon>
      </v-btn>
    </td>
    <rule-dialog v-model="dialog" :inputs.sync="form" title="Edit Rule" />
  </tr>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { settingsStore } from '~/store'
import Rule from '~/models/rule'
import RuleDialog from '~/components/RuleDialog.vue'

@Component({
  components: {
    RuleDialog,
  },
})
export default class RuleTableRow extends Vue {
  @Prop({ type: Object, required: true }) readonly item!: Rule

  dialog = false
  form = {}

  get condition() {
    return {
      contains: 'Contains',
      matches_regular_expression: 'Matches Regular Expression', // eslint-disable-line @typescript-eslint/camelcase
    }[this.item.condition]
  }

  get actionIcon() {
    return {
      mask_message: 'mdi-marker', // eslint-disable-line @typescript-eslint/camelcase
      hide_completely: 'mdi-eye-off', // eslint-disable-line @typescript-eslint/camelcase
    }[this.item.action]
  }

  @Watch('dialog')
  onDialogChanged(value: boolean) {
    if (!value && this.form) {
      settingsStore.setRule({
        ...this.form,
        id: this.item.id,
      })
    }
  }

  onClickEdit() {
    this.form = this.item
    this.dialog = true
  }
  onClickDelete() {
    settingsStore.removeRule({ id: this.item.id })
  }
}
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
