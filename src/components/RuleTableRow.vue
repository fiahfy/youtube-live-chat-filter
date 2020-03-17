<template>
  <tr>
    <td class="text-capitalize" v-text="item.field" />
    <td class="text-capitalize" v-text="condition" />
    <td class="value text-truncate" v-text="item.value" />
    <td>
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
    RuleDialog
  }
})
export default class RuleTableRow extends Vue {
  @Prop({ type: Object, required: true }) readonly item!: Rule

  dialog = false
  form = {}

  get condition() {
    return {
      'contains': 'contains',
      'matches_regular_expression': 'Matches Regular Expression'
    }[this.item.condition]
  }

  @Watch('dialog')
  onDialogChanged(value: boolean) {
    if (!value && this.form) {
      settingsStore.setRule({
        ...this.form,
        id: this.item.id
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
  max-width: 200px;
}
</style>
