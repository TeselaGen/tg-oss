import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";

let tippys = [];
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
      const inner = (content, el) => {
        innerRun = true;
        document.querySelectorAll(`.${id}`).forEach(elem => {
          elem.classList.remove(id);
        });

        el.classList.add(id);

        const inst = tippy(`.${id}`, {
          content,
          delay: [0, 0],
          allowHTML: true
        });
        clearOldTippys(...inst);
        inst.forEach(i => {
          i.show();
        });

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
        dataTip = el.getAttribute("data-tip");
        const isEllipsized =
          whiteSpace === "nowrap" && textOverflow === "ellipsis";

        if (dataTip) {
          if (dataTipStop) break;

          inner(dataTip, el);
          break;
        } else if (
          isEllipsized &&
          el.offsetWidth < el.scrollWidth - 4 && //the -4 is adding a teeny bit of tolerance to fix issues with the column headers getting tooltips even when fully visible
          !el.classList.contains("no-data-tip") &&
          el.textContent &&
          el.textContent?.trim?.().length !== 0
        ) {
          inner(el.textContent, el);
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
