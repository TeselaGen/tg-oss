import tippy, { followCursor } from "tippy.js";
import "tippy.js/dist/tippy.css";

let isDragging = false;
let canSetDragging = false;
document.addEventListener("mousedown", () => {
  canSetDragging = true;
  isDragging = false;
});
document.addEventListener("mousemove", () => {
  if (canSetDragging) {
    isDragging = true;
  }
});
document.addEventListener("mouseup", () => {
  canSetDragging = false;
  isDragging = false;
});

let tippys = [];
let recentlyHidden = false;
let clearMe;
(function () {
  let lastMouseOverElement = null;
  document.addEventListener("mouseover", function (event) {
    const element = event.target;

    if (element instanceof Element && element !== lastMouseOverElement) {
      lastMouseOverElement = element;

      const id = "tippyEllipsizedEl";
      // eslint-disable-next-line no-inner-declarations
      function clearOldTippys(maybeInst) {
        //clear old tippys
        tippys = tippys.filter(t => {
          const areeq = maybeInst?.reference?.isEqualNode(t.reference);
          if (!areeq) {
            t.destroy();
            return false;
          }
          return true;
        });
      }
      let innerRun = false;
      const inner = (
        content,
        el,
        { dataTitle, dataAvoid, dataAvoidBackup }
      ) => {
        innerRun = true;
        document.querySelectorAll(`.${id}`).forEach(elem => {
          elem.classList.remove(id);
        });

        el.classList.add(id);
        const inst = tippy(`.${id}`, {
          plugins: [followCursor],
          content,
          delay:
            dataTitle && !recentlyHidden
              ? [1300, 1300]
              : dataTitle
              ? [150, 150]
              : [0, 0],
          allowHTML: true,
          ...(dataTitle && {
            followCursor: dataTitle ? "initial" : false
          }),
          onHidden() {
            recentlyHidden = true;
            clearMe && clearTimeout(clearMe);
            clearMe = setTimeout(() => {
              if (tippys.length === 0) recentlyHidden = false;
            }, 700);
          },
          ...(dataAvoid && {
            popperOptions: {
              modifiers: [
                {
                  name: "myModifier",
                  enabled: true,
                  phase: "beforeWrite",
                  requires: ["computeStyles"],
                  requiresIfExists: ["offset"],
                  fn({ state }) {
                    // console.log(`state:`, state);
                    // state.styles.popper.bottom = 20 + "px";
                    const customBoundary =
                      document.querySelector(dataAvoid) ||
                      document.querySelector(dataAvoidBackup);

                    if (!customBoundary) return;
                    const a = customBoundary.getBoundingClientRect();
                    // console.log(
                    //   `state.rects.reference.y:`,
                    //   state.rects.reference.y
                    // );
                    // console.log(`a.top:`, a.top);

                    if (a.top < state.rects.reference.y) {
                      const b = Math.abs(
                        Math.abs(a.top - state.rects.reference.y) - 10
                      );
                      state.styles.popper.bottom = b + "px";
                    }

                    // const overflow = detectOverflow(state, {
                    //   boundary: customBoundary,
                    //   altBoundary: true
                    // });
                    // console.log(`overflow:`, overflow);
                    // if (overflow.bottom > 0) {
                    //   const a = Math.abs(overflow.bottom);
                    //   state.styles.popper.bottom = a + "px";
                    // }
                  }
                }
              ]
            }
          })
        });

        if (dataTitle) {
          inst[0]?.popper?.classList.add("isDataTitle");
        }
        clearOldTippys(...inst);

        if (!dataTitle) {
          inst.forEach(i => {
            i.show();
          });
        }

        tippys = [...tippys, ...inst];
        if (content === el.getAttribute("title")) {
          el.removeAttribute("title");
        }
      };
      const levels = 6;
      let dataTip;
      let dataTipStop;
      let el = element;
      for (let index = 0; index < levels; index++) {
        if (!el) continue;

        const style = window.getComputedStyle(el);
        const whiteSpace = style.getPropertyValue("white-space");
        const textOverflow = style.getPropertyValue("text-overflow");
        const dataTitle = el.getAttribute("data-title");
        const dataAvoid = el.getAttribute("data-avoid");
        const dataAvoidBackup = el.getAttribute("data-avoid-backup");
        dataTip = el.getAttribute("data-tip") || dataTitle;
        const isEllipsized =
          whiteSpace === "nowrap" && textOverflow === "ellipsis";

        const opts = {
          dataTitle,
          dataAvoid,
          dataAvoidBackup
        };
        if (
          dataTip &&
          !document.body.classList.contains("drag-active") &&
          !isDragging
        ) {
          if (dataTipStop) break;

          inner(dataTip, el, opts);
          break;
        } else if (
          isEllipsized &&
          el.offsetWidth < el.scrollWidth - 4 && //the -4 is adding a teeny bit of tolerance to fix issues with the column headers getting tooltips even when fully visible
          !el.classList.contains("no-data-tip") &&
          !document.body.classList.contains("drag-active") &&
          el.textContent &&
          el.textContent?.trim?.().length !== 0
        ) {
          inner(el.textContent, el, opts);
          break;
        } else if (isEllipsized && el.offsetWidth >= el.scrollWidth) {
          // break; //tnr: i don't think we need this..
        }
        el = el.parentElement;
      }

      if (!innerRun) {
        clearOldTippys();
      }
    }
  });
})();
