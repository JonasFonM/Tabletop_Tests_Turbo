import type { Handle } from "remix/component";
import { css } from "remix/component";

import type { Test } from "./data.ts";
import { Document } from "../document.tsx";
import { StrengthTest } from "../../ui/public/strength-test.tsx";

export function TestPage(handle: Handle<{ test: Test }>) {
  return () => {
    let { test } = handle.props;

    return (
      <Document title={`${test.title} - Tests`}>
        <main
          mix={css({
            maxWidth: "44rem",
            margin: "0 auto",
            padding: "4rem 1.5rem",
          })}
        >
          <p mix={css({ color: "#666" })}>
            {test.elements} . {test.element_type}
          </p>
          <h1>{test.title}</h1>
          <StrengthTest
            title="Test Your Might"
            showGMControls={true}
            initialConfig={{
              initialPower: 30,
              gainPerPress: 8,
              decayPerSecond: 5,
              timeLimitSeconds: 15,
            }}
          />

        </main>

      </Document>
    );
  };
}