import { Decoration, EditorState, syntaxTree } from "../deps.ts";
import {
  decoratorStateField,
  invisibleDecoration,
  isCursorInRange,
} from "./util.ts";

// Does a few things: hides the directives when the cursor is not placed inside
// Adds a class to the start and end of the directive when the cursor is placed inside
export function directivePlugin() {
  return decoratorStateField((state: EditorState) => {
    const widgets: any[] = [];

    syntaxTree(state).iterate({
      enter: ({ type, from, to, node }) => {
        const parent = node.parent;

        if (!parent) {
          return;
        }

        const cursorInRange = isCursorInRange(state, [parent.from, parent.to]);

        if (type.name === "DirectiveStart") {
          if (cursorInRange) {
            // Cursor outside this directive
            widgets.push(
              Decoration.line({ class: "sb-directive-start" }).range(from),
            );
          } else {
            widgets.push(invisibleDecoration.range(from, to));
            widgets.push(
              Decoration.line({ class: "sb-directive-start-outside" }).range(
                state.doc.lineAt(to).from,
              ),
            );
          }
          return true;
        }

        if (type.name === "DirectiveEnd") {
          // Cursor outside this directive
          if (cursorInRange) {
            widgets.push(
              Decoration.line({ class: "sb-directive-end" }).range(from),
            );
          } else {
            widgets.push(invisibleDecoration.range(from, to));
            widgets.push(
              Decoration.line({ class: "sb-directive-end-outside" }).range(
                state.doc.lineAt(from - 1).from,
              ),
            );
          }
          return true;
        }

        if (type.name === "DirectiveBody") {
          const lines = state.sliceDoc(from, to).split("\n");
          let pos = from;
          for (const line of lines) {
            if (pos !== to) {
              widgets.push(
                Decoration.line({
                  class: "sb-directive-body",
                }).range(pos),
              );
            }
            pos += line.length + 1;
          }
        }
      },
    });

    return Decoration.set(widgets, true);
  });
}
