<template>
  <v-card class="py-5" flat>
    <div class="text-right mb-3 px-5">
      <v-btn color="primary" depressed @click="onClickNew">
        New Rule
      </v-btn>
    </div>
    <rule-table />
    <rule-dialog v-model="dialog" :inputs.sync="form" />
  </v-card>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { settingsStore } from '~/store'
import Rule from '~/models/rule'
import RuleDialog from '~/components/RuleDialog.vue'
import RuleTable from '~/components/RuleTable.vue'

@Component({
  components: {
    RuleDialog,
    RuleTable
  }
})
export default class RuleTabItem extends Vue {
  dialog = false
  form: Partial<Rule> = {
    field: 'message',
    condition: 'contains',
    value: ''
  }

  get rules() {
    return settingsStore.rules
  }

  @Watch('dialog')
  onDialogChanged(value: boolean) {
    if (!value && this.form) {
      settingsStore.addRule({ ...this.form })
    }
  }
  @Watch('rules')
  onRulesChanged(value: Rule[], oldValue: Rule[]) {
    if (value.length > oldValue.length) {
      this.$nextTick(() => {
        window.scrollTo(0, document.body.scrollHeight)
      })
    }
  }

  onClickNew() {
    this.dialog = true
  }
}
</script>
