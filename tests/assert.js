export class AssertError extends Error {
  constructor(message, expected, actual) {
    super(message);
    this.name = 'AssertError';
    this.expected = expected;
    this.actual = actual;
  }
}

export const expect = (actual) => ({
  toBe(expected) {
    if (actual !== expected) {
      throw new AssertError(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`, expected, actual);
    }
  },
  toEqual(expected) {
    const aStr = JSON.stringify(actual);
    const eStr = JSON.stringify(expected);
    if (aStr !== eStr) {
      throw new AssertError(`Expected equality:\n${eStr}\nbut got:\n${aStr}`, expected, actual);
    }
  },
  toThrow(expectedText) {
    let threw = false;
    let errorMsg = '';
    try {
      actual();
    } catch (e) {
      threw = true;
      errorMsg = e.message;
    }
    if (!threw) {
      throw new AssertError(`Expected function to throw, but it did not.`, 'Error thrown', 'No error');
    }
    if (expectedText && !errorMsg.includes(expectedText)) {
      throw new AssertError(`Expected error message to contain "${expectedText}", but got "${errorMsg}"`, expectedText, errorMsg);
    }
  },
  toBeNull() {
    if (actual !== null) {
      throw new AssertError(`Expected null but got ${JSON.stringify(actual)}`, null, actual);
    }
  },
  toBeTruthy() {
    if (!actual) {
      throw new AssertError(`Expected truthy value but got ${JSON.stringify(actual)}`, true, actual);
    }
  },
  toBeFalsy() {
    if (actual) {
      throw new AssertError(`Expected falsy value but got ${JSON.stringify(actual)}`, false, actual);
    }
  }
});

export const suites = [];
let currentSuite = null;

export function describe(name, fn) {
  const suite = { name, specs: [] };
  suites.push(suite);
  currentSuite = suite;
  fn();
  currentSuite = null;
}

export function it(name, fn) {
  if (!currentSuite) {
    throw new Error('it() must be called inside describe()');
  }
  currentSuite.specs.push({ name, fn });
}

export async function runTests() {
  const results = [];
  for (const suite of suites) {
    const suiteResult = { name: suite.name, specs: [] };
    results.push(suiteResult);
    for (const spec of suite.specs) {
      try {
        await spec.fn();
        suiteResult.specs.push({ name: spec.name, status: 'pass' });
      } catch (err) {
        suiteResult.specs.push({
          name: spec.name,
          status: 'fail',
          message: err.message,
          stack: err.stack,
          expected: err.expected,
          actual: err.actual
        });
      }
    }
  }
  return results;
}
