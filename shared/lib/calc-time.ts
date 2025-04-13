import { GLOBAL_CONSTANTS } from '../constants';

export const formatTime = (hours: number, minutes: number = 0) => {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export const getWorkingTime = () => {
  const { START_OFFLINE_HOURS, START_OFFLINE_MINUTES, END } = GLOBAL_CONSTANTS.WORKING_HOURS;
  return `${formatTime(START_OFFLINE_HOURS, START_OFFLINE_MINUTES)} - ${formatTime(END)}`;
};

export const getOrderAcceptanceTime = () => {
  const { START, END, MIN_DELIVERY_TIME_HOURS, TIME_SLOT_DURATION } = GLOBAL_CONSTANTS.WORKING_HOURS;
  
  const endTime = new Date(0);
  endTime.setHours(END - MIN_DELIVERY_TIME_HOURS);
  endTime.setMinutes(-TIME_SLOT_DURATION);
  
  return `${formatTime(START)} - ${formatTime(endTime.getHours(), endTime.getMinutes())}`;
};