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

      <tabs ref="tabs" @tab-changed="generate">
        <tab title="chatl parsed" active style="height: 100%">
          <editor language="json" ref="raw" readonly />
        </tab>
        <tab title="snips" style="height: 100%">
          <editor language="json" ref="snips" readonly />
        </tab>
        <tab title="rasa" style="height: 100%">
          <editor language="json" ref="rasa" readonly />
        </tab>
      </tabs>
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
import chatl from './../../javascript/src/index';

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

@[dateStart](type=datetime)
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
        const data = chatl.parse(this.dsl);

        switch (this.$refs.tabs.current.title) {
          case 'snips':
            this.$refs.snips.editor.setValue(chatl.utils.toJSON(chatl.adapters.snips(data, JSON.parse(this.options))));
            break;
          case 'rasa':
            this.$refs.rasa.editor.setValue(chatl.utils.toJSON(chatl.adapters.rasa(data, JSON.parse(this.options))));
            break;
          default:
            this.$refs.raw.editor.setValue(chatl.utils.toJSON(data));
            break;
        }

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
