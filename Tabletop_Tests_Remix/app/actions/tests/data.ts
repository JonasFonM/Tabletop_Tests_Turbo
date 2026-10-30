export type Test = {
  id: string;
  title: string;
  elements: number;
  element_type: string;
};

let tests: Test[] = [
  {
    id: "mash",
    title: "Button Mash",
    elements: 1,
    element_type: "Button",
  },
];

export async function getTest(testId: string) {
  return tests.find((test) => test.id === testId);
}

export async function updateTest(testId: string, values: Partial<Test>) {
  let test = tests.find((test) => test.id === testId);

  if (test === undefined) {
    return undefined;
  }

  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 1000));

  Object.assign(test, values);
  return test;
}