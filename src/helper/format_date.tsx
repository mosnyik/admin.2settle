// import { useEffect, useState } from "react";

export function getFormattedDateTime(): string {
  const now = new Date();

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

  const time = `${formattedHours}:${formattedMinutes}${ampm}`;

  const day = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const formattedDate = `${day < 10 ? `0${day}` : day}/${
    month < 10 ? `0${month}` : month
  }/${year}`;

  return `${time} ${formattedDate}`;
}

import React, { useState, useEffect } from "react";

interface CountdownTimerProps {
  expiryTime: Date;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  expiryTime,
}) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = expiryTime.getTime() - new Date().getTime();
      return Math.max(0, Math.floor(difference / 1000));
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiryTime]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <span
      className={`font-bold text-xl ${
        timeLeft > 2 * 60 ? "text-green-600" : "text-red-600 animate-pulse"
      }`}
    >
      {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
    </span>
  );
};
