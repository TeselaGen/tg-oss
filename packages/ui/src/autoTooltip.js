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

// Track elements that had their tooltip attributes moved to parent
const processedDisabledElements = new WeakMap();

// Move tooltip attributes from disabled elements to their parent
function moveTooltipToParent(element) {
  // Check if element already processed
  if (processedDisabledElements.has(element)) {
    return;
  }

  // Check if the element is disabled and has tooltip attributes
  const isDisabled =
    element.disabled === true || element.getAttribute("disabled") !== null;
  const hasTipData =
    element.getAttribute("data-tip") ||
    element.getAttribute("data-title") ||
    (element.offsetWidth < element.scrollWidth &&
      element.textContent?.trim().length > 0);

  if (!isDisabled || !hasTipData) {
    return;
  }

  const parent = element.parentElement;
  if (!parent) {
    return;
  }

  // Copy tooltip-relevant attributes to the parent
  const tooltipAttrs = [
    "data-tip",
    "data-title",
    "data-avoid",
    "data-avoid-backup"
  ];
  let attrsMoved = false;
  const movedAttrs = []; // Track which attributes were moved

  tooltipAttrs.forEach(attr => {
    const value = element.getAttribute(attr);
    if (value) {
      // Add a data attribute to the parent only if it doesn't already have one
      if (!parent.hasAttribute(attr)) {
        parent.setAttribute(attr, value);
        movedAttrs.push(attr); // Record this attribute was moved
        attrsMoved = true;
      }
    }
  });

  // If element is ellipsized, add its text content as a data-tip to parent
  if (
    element.offsetWidth < element.scrollWidth &&
    element.textContent?.trim().length > 0
  ) {
    if (!parent.hasAttribute("data-tip")) {
      parent.setAttribute("data-tip", element.textContent);
      movedAttrs.push("data-tip"); // Record this attribute was moved
      attrsMoved = true;
    }
  }

  // Store information about moved attributes
  if (attrsMoved) {
    processedDisabledElements.set(element, {
      parent,
      movedAttrs
    });
  }
}

// Function to clear tooltips from parent elements
function clearParentTooltips(element) {
  if (!processedDisabledElements.has(element)) {
    return;
  }

  const { parent, movedAttrs } = processedDisabledElements.get(element);
  if (parent && movedAttrs) {
    // Remove all attributes that were added to the parent
    movedAttrs.forEach(attr => {
      parent.removeAttribute(attr);
    });

    // Remove the element from our tracking map
    processedDisabledElements.delete(element);
  }
}

// Function to scan for and process disabled elements
function scanForDisabledElements() {
  // First, check if any previously disabled elements are now enabled and clear their parent tooltips
  processedDisabledElements.forEach((value, element) => {
    const isStillDisabled =
      element.disabled === true || element.getAttribute("disabled") !== null;
    const isConnected = element.isConnected;

    if (!isStillDisabled || !isConnected) {
      clearParentTooltips(element);
    }
  });

  // Then process currently disabled elements
  document
    .querySelectorAll(
      "[disabled][data-tip], [disabled][data-title], button[disabled], input[disabled]"
    )
    .forEach(el => {
      moveTooltipToParent(el);
    });
}

// Initialize on load and periodically check for new disabled elements
window.addEventListener("DOMContentLoaded", scanForDisabledElements);
setInterval(scanForDisabledElements, 2000);

let tippys = [];
let recentlyHidden = false;
let clearMe;
(function () {
  let lastMouseOverElement = null;
  document.addEventListener("mouseover", function (event) {
    let element = event.target;

    // Special handling for disabled elements - we need to process their parent
    if (
      element instanceof Element &&
      (element.disabled === true || element.getAttribute("disabled") !== null)
    ) {
      // If this is a disabled element, we want to also process its parent
      // since that's where we moved the tooltip attributes
      const parent = element.parentElement;
      if (parent && processedDisabledElements.has(element)) {
        // Only process the parent if we've previously moved attributes to it
        element = parent;
      }
    }

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

        // Check if element is disabled, if so use parent instead
        let targetEl = el;
        if (targetEl.disabled || targetEl.getAttribute("disabled") !== null) {
          const parent = targetEl.parentElement;
          if (parent) {
            // Use the parent as the tooltip target
            parent.classList.add(id);
            targetEl = parent; // Change the tooltip target to parent
          } else {
            // No parent, keep using the original element
            el.classList.add(id);
          }
        } else {
          // Element not disabled, use it directly
          el.classList.add(id);
        }

        const inst = tippy(`.${id}`, {
          theme: "teselagen",
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
                    const customBoundary =
                      document.querySelector(dataAvoid) ||
                      document.querySelector(dataAvoidBackup);

                    if (!customBoundary) return;
                    const a = customBoundary.getBoundingClientRect();

                    if (a.top < state.rects.reference.y) {
                      const b = Math.abs(
                        Math.abs(a.top - state.rects.reference.y) - 10
                      );
                      state.styles.popper.bottom = b + "px";
                    }
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
          !parentIncludesNoChildDataTip(el, 0) &&
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

function parentIncludesNoChildDataTip(el, count) {
  if (count > 4) return false;
  if (!el) return false;
  // if attr data-no-child-data-tip is preset on the element, then we don't want to show a tooltip on any of its children
  if (el.getAttribute("data-no-child-data-tip")) return true;
  return parentIncludesNoChildDataTip(el.parentElement, count + 1);
}

// Export the function to clear parent tooltips so it can be used elsewhere
export { clearParentTooltips };
