import { clientEntry, css, on } from "remix/component";
import type { Handle } from "remix/component";

export type StrengthTestConfig = {
  initialPower: number;
  gainPerPress: number;
  decayPerSecond: number;
  timeLimitSeconds: number | null;
};

type StrengthTestProps = {
  title?: string;
  initialConfig?: Partial<StrengthTestConfig>;
  showGMControls?: boolean;
};

type TestStatus = "ready" | "running" | "success" | "failure";

const DEFAULT_CONFIG: StrengthTestConfig = {
  initialPower: 30,
  gainPerPress: 8,
  decayPerSecond: 5,
  timeLimitSeconds: 15,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeConfig(
  supplied?: Partial<StrengthTestConfig>,
): StrengthTestConfig {
  const initial = supplied?.initialPower ?? DEFAULT_CONFIG.initialPower;
  const gain = supplied?.gainPerPress ?? DEFAULT_CONFIG.gainPerPress;
  const decay = supplied?.decayPerSecond ?? DEFAULT_CONFIG.decayPerSecond;

  let limit =
    supplied?.timeLimitSeconds === undefined
      ? DEFAULT_CONFIG.timeLimitSeconds
      : supplied.timeLimitSeconds;

  if (limit !== null && !Number.isFinite(limit)) {
    limit = DEFAULT_CONFIG.timeLimitSeconds;
  }

  return {
    initialPower: clamp(initial, 0, 99),
    gainPerPress: clamp(gain, 0, 100),
    decayPerSecond: clamp(decay, 0, 100),
    timeLimitSeconds: limit === null ? null : clamp(limit, 1, 3600),
  };
}

const containerStyle = css({
  display: "grid",
  gap: "1.25rem",
  padding: "1.5rem",
  border: "1px solid #3f3f46",
  borderRadius: "16px",
  background: "#18181b",
  color: "#fafafa",
  maxWidth: "720px",
});

const headerStyle = css({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "0.75rem",
});

const meterTrackStyle = css({
  height: "24px",
  width: "100%",
  overflow: "hidden",
  border: "1px solid #52525b",
  borderRadius: "999px",
  background: "#27272a",
});

const meterFillStyle = css({
  height: "100%",
  background: "linear-gradient(90deg, #b45309, #facc15)",
  transition: "width 50ms linear",
  borderRadius: "999px",
});

const strikeButtonStyle = css({
  width: "100%",
  minHeight: "85px",
  border: "1px solid #a16207",
  borderRadius: "12px",
  background: "#292524",
  color: "#fef3c7",
  cursor: "pointer",
  fontSize: "1.1rem",
  fontWeight: "800",
  letterSpacing: "0.08em",
  "&:hover": { background: "#44403c" },
  "&:disabled": { opacity: 0.4, cursor: "not-allowed" },
});

const controlsStyle = css({
  display: "grid",
  gap: "1rem",
  padding: "1rem",
  border: "1px solid #3f3f46",
  borderRadius: "12px",
  background: "#202024",
});

const fieldsStyle = css({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: "0.85rem",
});

const fieldStyle = css({
  display: "grid",
  gap: "0.4rem",
  fontSize: "0.875rem",
  color: "#d4d4d8",
});

const inputStyle = css({
  width: "100%",
  boxSizing: "border-box",
  padding: "0.65rem",
  border: "1px solid #52525b",
  borderRadius: "8px",
  background: "#09090b",
  color: "#fafafa",
  font: "inherit",
});

const actionButtonStyle = css({
  padding: "0.7rem 1rem",
  border: "1px solid #52525b",
  borderRadius: "8px",
  background: "#3f3f46",
  color: "#fafafa",
  cursor: "pointer",
  font: "inherit",
  fontWeight: "600",
  "&:disabled": { opacity: 0.4, cursor: "not-allowed" },
});

export const StrengthTest = clientEntry(
  import.meta.url,
  function StrengthTest(handle: Handle<StrengthTestProps>) {
    let config = normalizeConfig(handle.props.initialConfig);
    let power = 0;
    let status: TestStatus = "ready";
    let elapsedSeconds = 0;
    let startedAt = 0;
    let lastTickAt = 0;
    let timerId: number | undefined;

    function stopTimer() {
      if (timerId !== undefined) {
        window.clearInterval(timerId);
        timerId = undefined;
      }
    }

    function finish(result: "success" | "failure") {
      if (status !== "running") return;
      status = result;
      stopTimer();
      handle.update();
    }

    function press() {
      if (status !== "running") return;

      power = clamp(power + config.gainPerPress, 0, 100);
      if (power >= 100) {
        finish("success");
        return;
      }
      handle.update();
    }

    function tick() {
      if (status !== "running") return;

      const now = performance.now();
      const deltaSeconds = (now - lastTickAt) / 1000;
      lastTickAt = now;
      elapsedSeconds = (now - startedAt) / 1000;

      power = clamp(
        power - config.decayPerSecond * deltaSeconds,
        0,
        100,
      );

      if (power <= 0) {
        finish("failure");
        return;
      }

      if (
        config.timeLimitSeconds !== null &&
        elapsedSeconds >= config.timeLimitSeconds
      ) {
        finish("failure");
        return;
      }

      handle.update();
    }

    function startTest() {
      stopTimer();
      power = config.initialPower;
      elapsedSeconds = 0;
      startedAt = performance.now();
      lastTickAt = startedAt;
      status = "running";

      handle.update();
      timerId = window.setInterval(tick, 50);
    }

    function resetTest() {
      stopTimer();
      power = 0;
      elapsedSeconds = 0;
      status = "ready";
      handle.update();
    }

    function updateNumericConfig(
      field: "initialPower" | "gainPerPress" | "decayPerSecond",
      rawValue: string,
    ) {
      if (rawValue.trim() === "") return;
      const value = Number(rawValue);
      if (!Number.isFinite(value)) return;

      switch (field) {
        case "initialPower":
          config.initialPower = clamp(value, 0, 99);
          break;
        case "gainPerPress":
          config.gainPerPress = clamp(value, 0, 100);
          break;
        case "decayPerSecond":
          config.decayPerSecond = clamp(value, 0, 100);
          break;
      }

      handle.update();
    }

    function updateTimeLimit(rawValue: string) {
      if (rawValue.trim() === "") {
        config.timeLimitSeconds = null;
      } else {
        const value = Number(rawValue);
        if (!Number.isFinite(value)) return;
        config.timeLimitSeconds = clamp(value, 1, 3600);
      }

      if (
        status === "running" &&
        config.timeLimitSeconds !== null &&
        elapsedSeconds >= config.timeLimitSeconds
      ) {
        finish("failure");
        return;
      }

      handle.update();
    }

    // Browser-only keyboard listener. Space and Enter are accepted globally,
    // except when the user is interacting with an input or the strike button.
    handle.queueTask(() => {
      if (handle.signal.aborted) return;

      window.addEventListener(
        "keydown",
        (event: KeyboardEvent) => {
          if (status !== "running" || event.repeat) return;

          const target = event.target;
          if (
            target instanceof HTMLElement &&
            target.closest(
              "[data-strength-strike], input, textarea, select, [contenteditable='true']",
            )
          ) {
            return;
          }

          if (event.code !== "Space" && event.code !== "Enter") return;

          event.preventDefault();
          press();
        },
        { signal: handle.signal },
      );

      handle.signal.addEventListener("abort", stopTimer, { once: true });
    });

    return () => {
      const timeRemaining =
        config.timeLimitSeconds === null
          ? null
          : Math.max(0, config.timeLimitSeconds - elapsedSeconds);

      const statusText: Record<TestStatus, string> = {
        ready: "READY",
        running: "TEST IN PROGRESS",
        success: "SUCCESS!",
        failure: "FAILED",
      };

      const showGMControls = handle.props.showGMControls ?? true;

      return (
        <section mix={containerStyle}>
          <div mix={headerStyle}>
            <h2>{handle.props.title ?? "Strength Test"}</h2>
            <span role="status" aria-live="polite">
              {statusText[status]}
            </span>
          </div>

          <div>
            <div mix={headerStyle}>
              <strong>POWER</strong>
              <strong>{Math.round(power)}%</strong>
            </div>

            <div
              mix={meterTrackStyle}
              role="meter"
              aria-label="Strength power"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(power)}
            >
              <div
                mix={meterFillStyle}
                style={{ width: `${power}%` }}
              />
            </div>
          </div>

          <div mix={headerStyle}>
            <span>
              {timeRemaining === null ? "Elapsed time" : "Time remaining"}
            </span>
            <strong>
              {timeRemaining === null
                ? `${elapsedSeconds.toFixed(1)}s`
                : `${timeRemaining.toFixed(1)}s`}
            </strong>
          </div>

          <button
            type="button"
            data-strength-strike="true"
            disabled={status !== "running"}
            mix={[strikeButtonStyle, on("click", press)]}
          >
            {status === "running"
              ? "STRIKE! — CLICK / SPACE / ENTER"
              : status === "success"
                ? "CHALLENGE COMPLETED"
                : status === "failure"
                  ? "CHALLENGE FAILED"
                  : "WAITING FOR THE GM"}
          </button>

          {showGMControls && (
            <section mix={controlsStyle}>
              <h3>Game Master Controls</h3>

              <div mix={fieldsStyle}>
                <label mix={fieldStyle}>
                  Initial power (%)
                  <input
                    type="number"
                    min="0"
                    max="99"
                    step="1"
                    defaultValue={config.initialPower}
                    mix={[
                      inputStyle,
                      on("input", (event) =>
                        updateNumericConfig(
                          "initialPower",
                          event.currentTarget.value,
                        ),
                      ),
                    ]}
                  />
                  <small>Applies to the next test.</small>
                </label>

                <label mix={fieldStyle}>
                  Power gained per press
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    defaultValue={config.gainPerPress}
                    mix={[
                      inputStyle,
                      on("input", (event) =>
                        updateNumericConfig(
                          "gainPerPress",
                          event.currentTarget.value,
                        ),
                      ),
                    ]}
                  />
                </label>

                <label mix={fieldStyle}>
                  Power lost per second
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    defaultValue={config.decayPerSecond}
                    mix={[
                      inputStyle,
                      on("input", (event) =>
                        updateNumericConfig(
                          "decayPerSecond",
                          event.currentTarget.value,
                        ),
                      ),
                    ]}
                  />
                </label>

                <label mix={fieldStyle}>
                  Time limit (seconds)
                  <input
                    type="number"
                    min="1"
                    max="3600"
                    step="1"
                    placeholder="No time limit"
                    defaultValue={config.timeLimitSeconds ?? ""}
                    mix={[
                      inputStyle,
                      on("input", (event) =>
                        updateTimeLimit(event.currentTarget.value),
                      ),
                    ]}
                  />
                  <small>Leave empty to disable the timer.</small>
                </label>
              </div>

              <div mix={headerStyle}>
                <button
                  type="button"
                  disabled={status === "running"}
                  mix={[actionButtonStyle, on("click", startTest)]}
                >
                  {status === "ready" ? "CALL TEST" : "RUN AGAIN"}
                </button>

                <button
                  type="button"
                  mix={[actionButtonStyle, on("click", resetTest)]}
                >
                  RESET
                </button>
              </div>

              <small>
                Gain, degradation, and time-limit changes apply immediately.
                Initial power applies to the next test.
              </small>
            </section>
          )}
        </section>
      );
    };
  },
);
