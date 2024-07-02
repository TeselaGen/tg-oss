import React, { useState } from "react";

/*

  const {toggleDialog, comp} = useDialog({
    ModalComponent: SimpleInsertData,
    validateAgainstSchema,
  });

  return <div>
    {comp} //stick the returned dialog comp somewhere in the dom! (it should not effect layout)
    {...your code here}
  </div>

*/
export const useDialog = ({ ModalComponent, ...rest }) => {
  const [isOpen, setOpen] = useState(false);
  const [additionalProps, setAdditionalProps] = useState(false);
  const comp = (
    <ModalComponent
      hideModal={() => {
        setOpen(false);
      }}
      hideDialog={() => {
        setOpen(false);
      }}
      {...rest}
      {...additionalProps}
      dialogProps={{
        isOpen,
        ...rest?.dialogProps,
        ...additionalProps?.dialogProps
      }}
    />
  );

  const toggleDialog = () => {
    setOpen(!isOpen);
  };

  const showDialogPromise = async (handlerName, moreProps = {}) => {
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
  };

  return { comp, showDialogPromise, toggleDialog, setAdditionalProps };
};
