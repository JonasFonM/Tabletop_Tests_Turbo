import { createController } from "remix/router";
import * as s from "remix/data-schema";
import * as f from "remix/data-schema/form-data";
import * as coerce from "remix/data-schema/coerce";
import { redirect } from "remix/response/redirect";

import { routes } from "../../../routes.ts";
import { getTest, updateTest } from "../data.ts";
import { TestEditPage } from "./page.tsx";

const testFormSchema = f.object({
  element_type: f.field(s.string()),
  title: f.field(s.string()),
  elements: f.field(coerce.number()),
});

export default createController(routes.tests.edit, {
  actions: {
    async index(context) {
      let test = await getTest(context.params.testId);

      if (test === undefined) {
        return new Response("Test not found", { status: 404 });
      }

      return context.render(<TestEditPage test={test} />);
    },
    async action({ formData, params }) {
      let result = s.parseSafe(testFormSchema, formData);

      if (!result.success) {
        return new Response("Invalid test data", { status: 400 });
      }

      let test = await updateTest(params.testId, result.value);

      if (test === undefined) {
        return new Response("Test not found", { status: 404 });
      }

      return redirect(routes.tests.show.href({ testId: test.id }), 303);
    },
  },
});