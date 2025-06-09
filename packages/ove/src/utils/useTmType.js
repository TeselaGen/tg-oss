import tgUseLocalStorageState from "tg-use-local-storage-state";

const useTmType = () => {
  return tgUseLocalStorageState("tmType", {
    isSimpleString: true,
    defaultValue: "breslauer1986Tm"
  });
};

export default useTmType;
