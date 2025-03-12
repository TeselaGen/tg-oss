import { BounceLoader } from "../src";
// eslint-disable-next-line @nx/enforce-module-boundaries
import renderDemo from "../../../helperUtils/renderDemo";
export default renderDemo(() => {
  return (
    <div>
      <BounceLoader></BounceLoader>
    </div>
  );
});
