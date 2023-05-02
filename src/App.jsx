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

  function handleAudio(shouldReset = false) {
    if (!audioRef.current) {
      return;
    }

    if (shouldReset) {
      audioRef.current.currentTime = 0;
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  }

  function startTimer(defaultState, setCurrentSession, setPause) {
    let intervalCleared = true;
    let nextTick = 1000;
    let { timerMinutes, timerSeconds } = defaultState;

    function handleTimerTick() {
      const startTime = Date.now();

      if (timerSeconds === 0) {
        timerMinutes--;
        timerSeconds = 60;
      }

      timerSeconds--;

      if (timerMinutes < 0 && intervalCleared) {
        intervalCleared = false;
        timerSeconds = 0;

        clearInterval(timerIntervalID);

        const nextSession =
          currentSession === "session"
            ? "break"
            : currentSession === "break"
            ? "session"
            : "break";

        timerMinutes = defaultState[`${nextSession}Mins`];

        setDefaultState({
          ...defaultState,
          timerMinutes,
          formattedTime: formatTime(timerMinutes, timerSeconds),
        });

        setCurrentSession(nextSession);
        setPause("restart");
      }

      setDefaultState({
        ...defaultState,
        timerMinutes,
        timerSeconds,
        formattedTime: formatTime(timerMinutes, timerSeconds),
      });

      const stoptime = Date.now();

      nextTick = 1000 - (stoptime - startTime);
    }

    const timerIntervalID = setInterval(handleTimerTick, nextTick);
    return timerIntervalID;
  }

  function handleTimeSetControls(type, action) {
    if (pause === "playing") return;

    const key = `${type}Mins`;

    if (action === "inc" && defaultState[key] < 60) {
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

  function handleSessionControls(type) {
    if (type === "reset") {
      handleAudio(true);
      setCurrentSession("session");
      setDefaultState(initialState);
      setPause("pause");
    } else {
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
        <div className="time-controls">
          <div className="duration-controls">
            <BreakLabel />
            <div className="control-display">
              <div
                className="controls decrement"
                id="break-decrement"
                onClick={() => handleTimeSetControls("break", "dec")}
              >
                <AiOutlineArrowDown />
              </div>
              <div id="break-length">{defaultState.breakMins}</div>
              <div
                className="controls increment"
                id="break-increment"
                onClick={() => handleTimeSetControls("break", "inc")}
              >
                <AiOutlineArrowUp />
              </div>
            </div>
          </div>
          <div className="duration-controls">
            <SessionLabel />
            <div className="control-display">
              <div
                className="controls decrement"
                id="session-decrement"
                onClick={() => handleTimeSetControls("session", "dec")}
              >
                <AiOutlineArrowDown />
              </div>
              <div id="session-length">{defaultState.sessionMins}</div>
              <div
                className="controls increment"
                id="session-increment"
                onClick={() => handleTimeSetControls("session", "inc")}
              >
                <AiOutlineArrowUp />
              </div>
            </div>
          </div>
        </div>
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
