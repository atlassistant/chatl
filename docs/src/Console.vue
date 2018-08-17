<template>
  <div class="console">
    <div class="console__editors">
      <tabs>
        <tab title="training.chatl" active style="height: 100%">
          <editor language="chatl" v-model="dsl" />
        </tab>
        <tab title="options.json" style="height: 100%">
          <editor language="json" v-model="options" />
        </tab>
      </tabs>

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
import Tabs from './Tabs.vue';
import Tab from './Tab.vue';
import chatl from './../../src/index';

export default {
  name: 'Console',
  components: {
    Editor,
    Tabs,
    Tab,
  },
  mounted() {
    this.generate();
  },
  data() {
    return {
      dsl: `%[get_forecast]
  will it rain in @[city] @[dateStart]

~[new york]
  ny
  nyc

@[dateStart](type=snips/datetime)
  at the end of the day
  tomorrow
  today

@[city]
  ~[new york]
  paris`,
      options: `{
  "language": "en"
}`,
      compileNotice: 'All right 👌',
    };
  },
  watch: {
    dsl() {
      this.generate();
    },
    options() {
      this.generate();
    },
  },
  methods: {
    generate: _.debounce(function () {

      try {
        const data = chatl.parse(this.dsl, chatl.generators.snips, this.options);

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

.console__editors > * {
  width: 50%;
}

.console__status {
  background-color: green;
  color: #fafafa;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
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
