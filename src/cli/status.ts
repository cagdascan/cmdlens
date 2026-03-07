import pc from "picocolors";

const SPINNER_FRAMES = ["|", "/", "-", "\\"];
const SPINNER_INTERVAL_MS = 80;

export interface StatusReporter {
  fail(message: string): void;
  start(message: string): void;
  succeed(message: string): void;
}

export async function withStatusMessage<T>(
  message: string,
  work: () => Promise<T>,
  reporter: StatusReporter = createSpinnerReporter(),
): Promise<T> {
  reporter.start(message);

  try {
    const result = await work();
    reporter.succeed("Codex response received.");
    return result;
  } catch (error) {
    reporter.fail("Codex request failed.");
    throw error;
  }
}

export function createSpinnerReporter(stream: NodeJS.WriteStream = process.stderr): StatusReporter {
  let frameIndex = 0;
  let interval: NodeJS.Timeout | undefined;
  let lastMessage = "";

  const render = (prefix: string, message: string): void => {
    stream.write(`\r\u001b[2K${prefix} ${message}`);
  };

  const clearSpinner = (): void => {
    if (interval) {
      clearInterval(interval);
      interval = undefined;
    }
  };

  return {
    start(message: string) {
      clearSpinner();
      lastMessage = message;
      render(pc.cyan(SPINNER_FRAMES[frameIndex]), message);
      interval = setInterval(() => {
        frameIndex = (frameIndex + 1) % SPINNER_FRAMES.length;
        render(pc.cyan(SPINNER_FRAMES[frameIndex]), lastMessage);
      }, SPINNER_INTERVAL_MS);
    },
    succeed(message: string) {
      clearSpinner();
      stream.write(`\r\u001b[2K${pc.green("✓")} ${message}\n`);
    },
    fail(message: string) {
      clearSpinner();
      stream.write(`\r\u001b[2K${pc.red("x")} ${message}\n`);
    },
  };
}
