import React, { useCallback, useMemo, useState } from "react";

/*

  const {toggleDialog, comp} = useDialog({
    ModalComponent: SimpleInsertData,
  });

  return <div>
    {comp} //stick the returned dialog comp somewhere in the dom! (it should not effect layout)
    {...your code here}
  </div>

*/
/*
  This useDialog is producing many rerenders for unknown reasons with cypress
*/
export const useDialog = ({ ModalComponent }) => {
  const [isOpen, setOpen] = useState(false);
  const [additionalProps, setAdditionalProps] = useState(false);
  const comp = useMemo(
    () => (
      <ModalComponent
        hideModal={() => {
          setOpen(false);
        }}
        hideDialog={() => {
          setOpen(false);
        }}
        {...additionalProps}
        dialogProps={{
          isOpen,
          ...additionalProps?.dialogProps
        }}
      />
    ),
    [ModalComponent, additionalProps, isOpen]
  );

  const toggleDialog = () => {
    setOpen(prev => !prev);
  };

  const showDialogPromise = useCallback(async (handlerName, moreProps = {}) => {
    return new Promise(resolve => {
      //return a promise that can be awaited
      setAdditionalProps({
        hideModal: () => {
          //override hideModal to resolve also
          setOpen(false);
          resolve({});
        },
        hideDialog: () => {
          //override hideModal to resolve also
          setOpen(false);
          resolve({});
        },
        [handlerName]: r => {
          setOpen(false);
          resolve(r || {});
        },
        //pass any additional props to the dialog
        ...moreProps
      });
      setOpen(true); //open the dialog
    });
  }, []);

  return { comp, showDialogPromise, toggleDialog, setAdditionalProps };
};
