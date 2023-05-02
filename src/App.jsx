import "./App.css";

import { useState, useRef, useEffect } from "react";
import { AiOutlineArrowDown, AiOutlineArrowUp } from "react-icons/ai";
import { BiPause, BiPlay, BiReset } from "react-icons/bi";

import { AudioSource } from "./components/AudioSource";
import { BreakLabel } from "./components/BreakLabel";
import { Header } from "./components/Header";
import { SessionLabel } from "./components/SessionLabel";

import { formatTime } from "./utils/formatTime";
import { initialState } from "./utils/initialState";

export default function App() {
  const [currentSession, setCurrentSession] = useState("session");
  const [defaultState, setDefaultState] = useState(initialState);
  const [intervalID, setIntervalID] = useState(null);
  const [pause, setPause] = useState("pause");

  const audioRef = useRef(null);

  // handles audio playback using the audioRef object.
  function handleAudio(shouldReset = false) {
    if (!audioRef.current) {
      return;
    }

    // set the current time of the audioRef to 0 and pause playback.
    if (shouldReset) {
      audioRef.current.currentTime = 0;
      audioRef.current.pause();
    } else {
      // play the audio.
      audioRef.current.play();
    }
  }

  /**
   * starts a timer countdown based on the default state values, which includes a timer for minutes and seconds.
   * @param {Object} defaultState - containing the default state values for the timer.
   * @param {function} setCurrentSession - set the current session (break or session).
   * @param {function} setPause - set the pause state.
   * @returns {number} ID of the timer interval.
   */
  function startTimer(defaultState, setCurrentSession, setPause) {
    let intervalCleared = true;
    let nextTick = 1000;
    let { timerMinutes, timerSeconds } = defaultState;

    /**
     * handles the timer tick.
     */
    function handleTimerTick() {
      const startTime = Date.now();

      // Decrements timer seconds
      if (timerSeconds === 0) {
        timerMinutes--;
        timerSeconds = 60;
      }
      timerSeconds--;

      // if the timer has ended, update the state
      if (timerMinutes < 0 && intervalCleared) {
        intervalCleared = false;
        timerSeconds = 0;
        clearInterval(timerIntervalID);

        // set next session (break or session)
        const nextSession =
          currentSession === "session"
            ? "break"
            : currentSession === "break"
            ? "session"
            : "break";

        // update state with next session values
        timerMinutes = defaultState[`${nextSession}Mins`];

        setDefaultState({
          ...defaultState,
          timerMinutes,
          formattedTime: formatTime(timerMinutes, timerSeconds),
        });

        setCurrentSession(nextSession);
        setPause("restart");
      }

      // update timer state
      setDefaultState({
        ...defaultState,
        timerMinutes,
        timerSeconds,
        formattedTime: formatTime(timerMinutes, timerSeconds),
      });

      const stoptime = Date.now();

      // time difference between start time and stop time
      nextTick = 1000 - (stoptime - startTime);
    }

    // set interval for timer
    const timerIntervalID = setInterval(handleTimerTick, nextTick);
    return timerIntervalID;
  }

  function handleTimeSetControls(type, action) {
    if (pause === "playing") return;

    const key = `${type}Mins`;

    if (action === "inc" && defaultState[key] < 60) {
      // if action is "inc" and duration is less than 60 minutes,
      // update state to increase duration by 1 minute
      setDefaultState({
        ...defaultState,
        [key]: defaultState[key] + 1,
        ...(type === currentSession && {
          timerMinutes: defaultState[key] + 1,
          timerSeconds: 0,
          formattedTime: formatTime(defaultState[key] + 1, 0),
        }),
      });
    } else if (action === "dec" && defaultState[key] > 1) {
      // if action is "dec" and duration is greater than 1 minute,
      // update state to decrease duration by 1 minute
      setDefaultState({
        ...defaultState,
        [key]: defaultState[key] - 1,
        ...(type === currentSession && {
          timerMinutes: defaultState[key] - 1,
          timerSeconds: 0,
          formattedTime: formatTime(defaultState[key] - 1, 0),
        }),
      });
    }
  }

  /**
   * handles the session controls such as pause, play and reset.
   * @param {string} type - session control, can be "reset", "pause" or "playing".
   * "reset" resets the session to the initial state,
   * "pause" pauses the session and "playing" resumes the session.
   */
  function handleSessionControls(type) {
    if (type === "reset") {
      // Resets the session to the initial state
      handleAudio(true); // Stops the audio
      setCurrentSession("session"); // Sets the session to "session"
      setDefaultState(initialState); // Sets the default state to the initial state
      setPause("pause"); // Sets the pause state to "pause"
    } else {
      // Toggles the pause state
      setPause(pause === "playing" ? "pause" : "playing");
    }
  }

  useEffect(() => {
    if (pause === "playing") {
      setIntervalID(startTimer(defaultState, setCurrentSession, setPause));
    } else {
      clearInterval(intervalID);
      if (pause === "restart") {
        handleAudio();
        setPause("playing");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pause]);

  return (
    <div className="container">
      <Header />
      <main>
        <section className="time-controls">
          <article className="duration-controls">
            <BreakLabel />
            <div
              className="control-display"
              role="group"
              aria-labelledby="session-label"
            >
              <div
                className="controls decrement"
                id="break-decrement"
                onClick={() => handleTimeSetControls("break", "dec")}
              >
                <AiOutlineArrowDown />
              </div>
              <output id="break-length" name="break-length">
                {defaultState.breakMins}
              </output>
              <div
                className="controls increment"
                id="break-increment"
                onClick={() => handleTimeSetControls("break", "inc")}
              >
                <AiOutlineArrowUp />
              </div>
            </div>
          </article>

          <article className="duration-controls">
            <SessionLabel />
            <div
              className="control-display"
              role="group"
              aria-labelledby="session-label"
            >
              <div
                className="controls decrement"
                id="session-decrement"
                onClick={() => handleTimeSetControls("session", "dec")}
              >
                <AiOutlineArrowDown />
              </div>
              <output id="session-length" name="session-length">
                {defaultState.sessionMins}
              </output>
              <div
                className="controls increment"
                id="session-increment"
                onClick={() => handleTimeSetControls("session", "inc")}
              >
                <AiOutlineArrowUp />
              </div>
            </div>
          </article>
        </section>

        <div className="timer-display">
          <div className="session-title">
            <span id="timer-label">{currentSession} Time</span>
          </div>
          <div className="session-timer">
            <div
              id="time-left"
              style={{
                color: defaultState.timerMinutes === 0 ? "#b91c1c" : "#15803d",
              }}
            >
              {defaultState.formattedTime}
            </div>
          </div>

          <div className="session-controls">
            <div
              className="controls"
              id="start_stop"
              onClick={() => handleSessionControls("play_pause")}
            >
              {pause === "playing" ? <BiPause /> : <BiPlay />}
            </div>
            <div
              className="controls"
              id="reset"
              onClick={() => handleSessionControls("reset")}
              title="Reset"
            >
              <BiReset />
            </div>
          </div>
          <audio id="beep" preload="auto" ref={audioRef}>
            <AudioSource />
          </audio>
        </div>
      </main>
    </div>
  );
}
