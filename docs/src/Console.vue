<template>
  <div class="console">
    <div class="console__editors">
      <editor language="chatl" v-model="dsl" />

      <editor language="json" ref="result" readonly />
    </div>

    <div class="console__status" :class="{ 'console__status--error': compileNotice !== 'All right 👌' }">
      {{compileNotice}}
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import Editor from './Editor.vue';
import chatl from './../../src/index';

export default {
  name: 'Console',
  components: {
    Editor,
  },
  data() {
    return {
      dsl: '',
      compileNotice: 'All right 👌',
    };
  },
  watch: {
    dsl() {
      this.generate();
    },
  },
  methods: {
    generate: _.debounce(function () {

      try {
        const data = chatl.parse(this.dsl, chatl.generators.snips);

        this.$refs.result.editor.setValue(JSON.stringify(data, null, 2));

        this.compileNotice = 'All right 👌';
      } catch (e) {
        if (e.location) {
          this.compileNotice = `⚠️ ${e.name} at line ${e.location.start.line}: ${e.message}`;
        } else {
          this.compileNotice = `️️⚠️ An error occured, please review your files: ${e.message}`;
        }
      }
    }, 500),
  },
}
</script>

<style>

html,
body {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  overflow: hidden;
  height: 100%;
}

.console {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.console__editors {
  display: flex;
  flex: 1;
}

.console__status {
  background-color: green;
  color: #fafafa;
  font-family: Consolas, 'Courier New', monospace;
  font-size: 14px;
  line-height: 19px;
  letter-spacing: 0px;
  padding: 8px;
  text-align: right;
}

.console__status--error {
  background-color: red;
}

</style>
