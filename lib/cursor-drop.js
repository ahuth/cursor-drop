'use babel';

import { CompositeDisposable } from 'atom';

export default {
  anchors: null,
  subscriptions: null,

  activate(state) {
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'cursor-drop:toggle-anchor': () => this.toggle(),
      'cursor-drop:convert-anchors': () => this.convert(),
      'cursor-drop:cancel': () => this.cancel(),
    }));
  },

  deactivate() {
    this.anchors && this.anchors.destroy();
    this.anchors = null;
    this.subscriptions.dispose();
  },

  toggle() {
    const editor = atom.workspace.getActiveTextEditor();
    this.anchors = this.anchors || editor.addMarkerLayer();

    const lastCursor = editor.getLastCursor();
    const position = lastCursor.getBufferPosition();

    const existingAnchors = this.anchors.findMarkers({
      startBufferPosition: position,
    });

    if (existingAnchors.length === 0) {
      this.anchors.markBufferPosition(position, { invalidate: 'never' });
    } else {
      existingAnchors.forEach(anchor => anchor.destroy());
    }

    if (this.anchors.getMarkerCount() === 0) {
      this.cancel();
    } else {
      editor.decorateMarkerLayer(this.anchors, { type: 'cursor' });
    }
  },

  convert() {
    const editor = atom.workspace.getActiveTextEditor();

    this.anchors && this.anchors.getMarkers().forEach((anchor) => {
      editor.addCursorAtBufferPosition(anchor.getHeadBufferPosition());
    });

    this.cancel();
  },

  cancel() {
    this.anchors && this.anchors.clear();
  },
};
