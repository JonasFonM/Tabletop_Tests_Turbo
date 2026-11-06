import type { Handle } from "remix/component";
import { css } from "remix/component";

import { TestEditForm } from "./public/test-edit-form.tsx";
import { Document } from "../../document.tsx";
import type { Test } from "../data.ts";

export function TestEditPage(handle: Handle<{ test: Test }>) {
  return () => {
    let { test } = handle.props;

    return (
      <Document title={`Edit ${test.title} — Tests`}>
        <main mix={css({ padding: "1rem" })}>
          <h1>Edit {test.title}</h1>
          <TestEditForm test={test} />
        </main>
      </Document>
    );
  };
}