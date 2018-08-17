import * as monaco from 'monaco-editor';

export default {
  install() {
    monaco.languages.register({ id: 'chatl' });
    monaco.languages.setMonarchTokensProvider('chatl', {
      tokenizer: {
        root: [
          [/%\[.*?\]/, 'intent'],
          [/@\[.*?\]/, 'entity'],
          [/~\[.*?\]/, 'synonym'],
          [/^#.*/, 'comment'],
        ]
      }
    });
    monaco.editor.defineTheme('chatl-theme', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'intent', foreground: 'F50057' },
        { token: 'entity', foreground: 'CDDC39' },
        { token: 'synonym', foreground: '2979FF' },
      ]
    });
  },
}