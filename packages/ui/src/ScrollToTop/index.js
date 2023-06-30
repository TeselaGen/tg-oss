import React, { useEffect, useState } from "react";
import { Button } from "@blueprintjs/core";
import { Transition } from "react-transition-group";

const duration = 300;

const defaultStyle = {
  transition: `opacity ${duration}ms ease-in-out`,
  opacity: 0
};

const transitionStyles = {
  entering: { opacity: 1 },
  entered: { opacity: 1 },
  exiting: { opacity: 0 },
  exited: { opacity: 0 }
};

function ScrollToTop({
  showAt = 150,
  scrollContainer = document.scrollingElement
}) {
  const [shouldShow, setShouldShow] = useState(
    scrollContainer.scrollTop >= showAt
  );

  useEffect(() => {
    const scrollListener = () => {
      const newShouldShow = scrollContainer.scrollTop >= showAt;
      if (newShouldShow !== shouldShow) setShouldShow(newShouldShow);
    };
    const listenerContainer =
      scrollContainer === document.scrollingElement ? window : scrollContainer;
    listenerContainer.addEventListener("scroll", scrollListener);
    // Specify how to clean up after this effect:
    return function cleanup() {
      listenerContainer.removeEventListener("scroll", scrollListener);
    };
  }, [shouldShow, showAt, scrollContainer]);

  const scrollToTop = () => {
    const c = scrollContainer.scrollTop;
    if (c > 0) {
      window.requestAnimationFrame(scrollToTop);
      scrollContainer.scrollTo(0, c - c / 8);
    }
  };

  return (
    <Transition in={shouldShow} timeout={duration}>
      {state =>
        state === "exited" ? null : (
          <div style={{ position: "fixed", bottom: 25, right: 25, zIndex: 10 }}>
            <Button
              style={{
                borderRadius: "50%",
                ...defaultStyle,
                ...transitionStyles[state]
              }}
              intent="primary"
              icon="arrow-up"
              large
              onClick={scrollToTop}
            />
          </div>
        )
      }
    </Transition>
  );
}

export default ScrollToTop;
