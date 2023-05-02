import { formatTime } from "./formatTime";

// initial defaultState of a timer
export const initialState = {
  breakMins: 5,
  formattedTime: formatTime(25, 0),
  sessionMins: 25,
  timerMinutes: 25,
  timerSeconds: 0,
};
