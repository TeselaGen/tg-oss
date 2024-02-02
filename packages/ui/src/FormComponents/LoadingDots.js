import React, { useEffect, useState } from "react";

export const LoadingDots = () => {
  const [dots, setDots] = useState("");
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(dots => {
        return dots.length === 3 ? "" : dots + ".";
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);
  return <span>{dots}</span>;
};
