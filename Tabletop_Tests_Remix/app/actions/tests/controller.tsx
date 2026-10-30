import { createController } from "remix/router";
import { routes } from "../../routes.ts";
import { getTest } from "./data.ts";
import { TestPage } from "./show-page.tsx";


export default createController(routes.tests, {
  actions: {
    async show(context) {
      let test = await getTest(context.params.testId)
      if (test === undefined) {
        return new Response("Test not found", { status: 404 })
      }

      return context.render(<TestPage test={test} />);
    },
  },
});