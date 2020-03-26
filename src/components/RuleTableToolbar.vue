<template>
  <v-toolbar flat color="transparent">
    <v-spacer />
    <v-btn color="primary" depressed @click="onClickNew">
      New Rule
    </v-btn>
    <rule-dialog v-model="dialog" :inputs.sync="form" />
  </v-toolbar>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { settingsStore } from '~/store'
import Rule from '~/models/rule'
import RuleDialog from '~/components/RuleDialog.vue'

@Component({
  components: {
    RuleDialog,
  },
})
export default class RuleTableToolbar extends Vue {
  dialog = false
  form: Partial<Rule> = {
    field: 'message',
    condition: 'contains',
    value: '',
  }

  @Watch('dialog')
  onDialogChanged(value: boolean) {
    if (!value && this.form) {
      settingsStore.addRule({ ...this.form })
    }
  }

  onClickNew() {
    this.dialog = true
  }
}
</script>
