<template>
  <div class="c-editor">

  </div>
</template>

<script>
import * as monaco from 'monaco-editor';

export default {
  name: 'Editor',
  props: {
    language: {
      type: String,
      required: true,
    },
    readonly: Boolean,
    value: String,
  },
  mounted() {
    this.editor = monaco.editor.create(this.$el, {
      language: this.language,
      readOnly: this.readonly,
      automaticLayout: true,
      value: this.value,
      theme: 'chatl-theme',
    });

    this.editor.onDidChangeModelContent(e => this.$emit('input', this.editor.getValue()));
  },
}
</script>

<style>

.c-editor {
  height: 100%;
  width: 100%;
}

</style>


