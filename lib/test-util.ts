export function withMockConsoleLog(fn: (mock: jest.Mock) => void) {
  const originalLog = console.log;
  const mockLog = jest.fn();
  console.log = mockLog;
  try {
    fn(mockLog);
  } finally {
    console.log = originalLog;
  }
}
