import { css } from "remix/component";
import type { Handle } from "remix/component";

import { routes } from "../../../routes.ts";
import { Document } from "../../document.tsx";
import type { Test } from "../data.ts";

export function TestEditPage(handle: Handle<{ test: Test }>) {
  return () => {
    let { test } = handle.props;

    return (
      <Document title={`Edit ${test.title} — Tests`}>
        <main mix={css({ padding: "1rem" })}>
          <h1>Edit {test.title}</h1>
          <form
            action={routes.tests.edit.action.href({ testId: test.id })}
            method="post"
            mix={css({
              display: "grid",
              gap: "0.75rem",
              maxWidth: "fit-content",
              "& input": {
                marginLeft: "0.5rem",
              },
            })}
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
            <button type="submit">Save test</button>
          </form>
        </main>
      </Document>
    );
  };
}