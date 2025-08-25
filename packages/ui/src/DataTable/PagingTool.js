import React, { useState, useEffect, useRef, useCallback } from "react";
import classNames from "classnames";
import { noop, toInteger } from "lodash-es";
import { Button, Classes } from "@blueprintjs/core";
import { onEnterOrBlurHelper } from "../utils/handlerHelpers";
import { defaultPageSizes } from "./utils/queryParams";
import { getIdOrCodeOrIndex } from "./utils";

function PagingInput({ disabled, onBlur, defaultPage }) {
  const [page, setPage] = useState(defaultPage);
  const defaultValue = useRef(defaultPage);

  useEffect(() => {
    if (page !== defaultPage && defaultValue.current !== defaultPage) {
      setPage(defaultPage);
    }
    defaultValue.current = defaultPage;
  }, [page, defaultPage]);

  return (
    <input
      name="page"
      style={{
        marginLeft: 5,
        width: page > 999 ? 65 : page > 99 ? 45 : 35,
        marginRight: 8
      }}
      value={page}
      disabled={disabled}
      onChange={e => {
        setPage(e.target.value);
      }}
      {...onEnterOrBlurHelper(onBlur)}
      className={Classes.INPUT}
    />
  );
}

// Define the functional component and its props
const PagingTool = ({
  controlled_hasNextPage,
  controlled_onRefresh,
  controlled_page,
  controlled_setPage,
  controlled_setPageSize,
  controlled_total,
  disabled: _disabled,
  disableSetPageSize,
  entities,
  entityCount,
  hideSetPageSize,
  hideTotalPages,
  keepSelectionOnPageChange,
  onRefresh: _onRefresh,
  page: _page,
  pageSize,
  pagingDisabled,
  persistPageSize = noop,
  scrollToTop,
  setPage: _setPage,
  setPageSize: _setPageSize,
  setSelectedEntityIdMap
}) => {
  const page = controlled_page || _page;
  const total = controlled_total || entityCount;
  const disabled = _disabled || pagingDisabled;
  const onRefresh = controlled_onRefresh || _onRefresh;
  const setPage = controlled_setPage || _setPage;
  const setPageSize = controlled_setPageSize || _setPageSize;

  const onPageChange = useCallback(() => {
    const record = entities?.[0];
    if (
      !keepSelectionOnPageChange &&
      (!record || !getIdOrCodeOrIndex(record))
    ) {
      setSelectedEntityIdMap({});
    }
    scrollToTop();
  }, [
    entities,
    keepSelectionOnPageChange,
    scrollToTop,
    setSelectedEntityIdMap
  ]);
  // Define local state
  const [refetching, setRefetching] = useState(false);

  // Initialize additional page sizes
  useEffect(() => {
    const additionalPageSize =
      window.frontEndConfig && window.frontEndConfig.additionalPageSize
        ? [toInteger(window.frontEndConfig.additionalPageSize)]
        : [];
    window.tgPageSizes = [...defaultPageSizes, ...additionalPageSize];
  }, []);

  // Define event handlers for the component
  const onRefreshHandler = async () => {
    setRefetching(true);
    await onRefresh();
    setRefetching(false);
  };

  const setPageHandler = page => {
    setPage(page);
    onPageChange(page);
  };

  const setPageSizeHandler = e => {
    const newPageSize = parseInt(e.target.value, 10);
    setPageSize(newPageSize);
    persistPageSize(newPageSize);
  };

  const pageBackHandler = () => {
    setPageHandler(parseInt(page, 10) - 1);
  };

  const pageForwardHandler = () => {
    setPageHandler(parseInt(page, 10) + 1);
  };

  const pageInputBlurHandler = e => {
    const lastPage = Math.ceil(total / pageSize);
    const pageValue = parseInt(e.target.value, 10);
    const selectedPage =
      pageValue > lastPage
        ? lastPage
        : pageValue < 1 || isNaN(pageValue)
          ? 1
          : pageValue;
    setPageHandler(selectedPage);
  };

  // Define rendering logic
  const pageStart = (page - 1) * pageSize + 1;
  if (pageStart < 0) throw new Error("We should never have page be <0");
  const backEnabled = page - 1 > 0;
  const forwardEnabled = page * pageSize < total;
  const lastPage = Math.ceil(total / pageSize);
  const options = [...(window.tgPageSizes || defaultPageSizes)];
  if (!options.includes(pageSize)) {
    options.push(pageSize);
  }

  return (
    <div className="paging-toolbar-container">
      {onRefresh && (
        <Button
          minimal
          loading={refetching}
          icon="refresh"
          disabled={disabled}
          onClick={onRefreshHandler}
        />
      )}
      {!hideSetPageSize && (
        <div
          title="Set Page Size"
          className={classNames(Classes.SELECT, Classes.MINIMAL)}
        >
          <select
            name="page-size"
            className="paging-page-size"
            onChange={setPageSizeHandler}
            disabled={disabled || disableSetPageSize}
            value={pageSize}
          >
            {[
              <option key="page-size-placeholder" disabled value="fake">
                Size
              </option>,
              ...options.map(size => {
                return (
                  <option key={size} value={size}>
                    {size}
                  </option>
                );
              })
            ]}
          </select>
        </div>
      )}
      <Button
        onClick={pageBackHandler}
        disabled={!backEnabled || disabled}
        minimal
        className="paging-arrow-left"
        icon="chevron-left"
      />
      <div>
        {hideTotalPages ? (
          page
        ) : total ? (
          <div>
            <PagingInput
              disabled={disabled}
              onBlur={pageInputBlurHandler}
              defaultPage={page}
              lastPage={lastPage}
            />
            of {lastPage}
          </div>
        ) : (
          "No Rows"
        )}
      </div>
      <Button
        style={{ marginLeft: 5 }}
        disabled={
          (controlled_hasNextPage === undefined
            ? !forwardEnabled
            : !controlled_hasNextPage) || disabled
        }
        icon="chevron-right"
        minimal
        className="paging-arrow-right"
        onClick={pageForwardHandler}
      />
    </div>
  );
};

export default PagingTool;
