import { clientEntry, css, on } from "remix/component";
import type { Handle } from "remix/component";

import { routes } from "../../../../routes.ts";

interface Test {
  element_type: string;
  id: string;
  title: string;
  elements: number;
}

export const TestEditForm = clientEntry(
    import.meta.url,
    function TestEditForm(handle: Handle<{ test: Test }>) {
      let pending = false;

  return () => {
    let { test } = handle.props;

    return (
      <form
        action={routes.tests.edit.action.href({ testId: test.id })}
        method="post"
        mix={[
            css({ display: "grid", gap: "0.75rem", maxWidth: "fit-content" }),
            on("submit", () => {
              pending = true;
              handle.update();
            }),
          ]}
      >
        <label>
          Title
          <input name="title" defaultValue={test.title} required />
        </label>
        <label>
          Element Type
          <input name="element_type" defaultValue={test.element_type} required />
        </label>
        <label>
          Elements
          <input name="elements" defaultValue={test.elements} required type="number" />
        </label>
        <button disabled={pending} type="submit">
          {pending ? "Saving…" : "Save Test"}
         </button>
      </form>
    );
  };
});