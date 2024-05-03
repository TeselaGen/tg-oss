/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-redeclare */
/* eslint-disable no-var */
import { jsx, Fragment, jsxs } from 'react/jsx-runtime';
import { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import TgSelect from '../TgSelect';
import { Button } from '@blueprintjs/core';
import './Cron.css';

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}

var SUPPORTED_SHORTCUTS = [
    {
        name: '@yearly',
        value: '0 0 1 1 *',
    },
    {
        name: '@annually',
        value: '0 0 1 1 *',
    },
    {
        name: '@monthly',
        value: '0 0 1 * *',
    },
    {
        name: '@weekly',
        value: '0 0 * * 0',
    },
    {
        name: '@daily',
        value: '0 0 * * *',
    },
    {
        name: '@midnight',
        value: '0 0 * * *',
    },
    {
        name: '@hourly',
        value: '0 * * * *',
    },
];
var UNITS = [
    {
        type: 'minutes',
        min: 0,
        max: 59,
        total: 60,
    },
    {
        type: 'hours',
        min: 0,
        max: 23,
        total: 24,
    },
    {
        type: 'month-days',
        min: 1,
        max: 31,
        total: 31,
    },
    {
        type: 'months',
        min: 1,
        max: 12,
        total: 12,
        alt: [
            'JAN',
            'FEB',
            'MAR',
            'APR',
            'MAY',
            'JUN',
            'JUL',
            'AUG',
            'SEP',
            'OCT',
            'NOV',
            'DEC',
        ],
    },
    {
        type: 'week-days',
        min: 0,
        max: 6,
        total: 7,
        alt: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
    },
];

var DEFAULT_LOCALE_EN = {
    everyText: 'every',
    emptyMonths: 'every month',
    emptyMonthDays: 'every day of the month',
    emptyMonthDaysShort: 'day of the month',
    emptyWeekDays: 'every day of the week',
    emptyWeekDaysShort: 'day of the week',
    emptyHours: 'every hour',
    emptyMinutes: 'every minute',
    emptyMinutesForHourPeriod: 'every',
    yearOption: 'year',
    monthOption: 'month',
    weekOption: 'week',
    dayOption: 'day',
    hourOption: 'hour',
    minuteOption: 'minute',
    rebootOption: 'reboot',
    prefixPeriod: 'Every',
    prefixMonths: 'in',
    prefixMonthDays: 'on',
    prefixWeekDays: 'on',
    prefixWeekDaysForMonthAndYearPeriod: 'and',
    prefixHours: 'at',
    prefixMinutes: ':',
    prefixMinutesForHourPeriod: 'at',
    suffixMinutesForHourPeriod: 'minute(s)',
    errorInvalidCron: 'Invalid cron expression',
    clearButtonText: 'Clear',
    weekDays: [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
    ],
    months: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ],
    altWeekDays: [
        'SUN',
        'MON',
        'TUE',
        'WED',
        'THU',
        'FRI',
        'SAT',
    ],
    altMonths: [
        'JAN',
        'FEB',
        'MAR',
        'APR',
        'MAY',
        'JUN',
        'JUL',
        'AUG',
        'SEP',
        'OCT',
        'NOV',
        'DEC',
    ],
};

function range(start, end) {
    var array = [];
    for (var i = start; i <= end; i++) {
        array.push(i);
    }
    return array;
}
function sort(array) {
    array.sort(function (a, b) {
        return a - b;
    });
    return array;
}
function dedup(array) {
    var result = [];
    array.forEach(function (i) {
        if (result.indexOf(i) < 0) {
            result.push(i);
        }
    });
    return result;
}
function classNames(classes) {
    return Object.entries(classes)
        .filter(function (_a) {
        var key = _a[0], value = _a[1];
        return key && value;
    })
        .map(function (_a) {
        var key = _a[0];
        return key;
    })
        .join(' ');
}
function setError(onError, locale) {
    onError &&
        onError({
            type: 'invalid_cron',
            description: locale.errorInvalidCron || DEFAULT_LOCALE_EN.errorInvalidCron,
        });
}
function usePrevious(value) {
    var ref = useRef(value);
    useEffect(function () {
        ref.current = value;
    }, [value]);
    return ref.current;
}
function convertStringToNumber(str) {
    var parseIntValue = parseInt(str, 10);
    var numberValue = Number(str);
    return parseIntValue === numberValue ? numberValue : NaN;
}

function setValuesFromCronString(cronString, setInternalError, onError, allowEmpty, internalValueRef, firstRender, locale, shortcuts, setMinutes, setHours, setMonthDays, setMonths, setWeekDays, setPeriod) {
    onError && onError(undefined);
    setInternalError(false);
    var error = false;
    if (!cronString) {
        if (allowEmpty === 'always' ||
            (firstRender && allowEmpty === 'for-default-value')) {
            return;
        }
        error = true;
    }
    if (!error) {
        if (shortcuts &&
            (shortcuts === true || shortcuts.includes(cronString))) {
            if (cronString === '@reboot') {
                setPeriod('reboot');
                return;
            }
            var shortcutObject = SUPPORTED_SHORTCUTS.find(function (supportedShortcut) { return supportedShortcut.name === cronString; });
            if (shortcutObject) {
                cronString = shortcutObject.value;
            }
        }
        try {
            var cronParts = parseCronString(cronString);
            var period = getPeriodFromCronParts(cronParts);
            setPeriod(period);
            setMinutes(cronParts[0]);
            setHours(cronParts[1]);
            setMonthDays(cronParts[2]);
            setMonths(cronParts[3]);
            setWeekDays(cronParts[4]);
        }
        catch (err) {
            error = true;
        }
    }
    if (error) {
        internalValueRef.current = cronString;
        setInternalError(true);
        setError(onError, locale);
    }
}
function getCronStringFromValues(period, months, monthDays, weekDays, hours, minutes, humanizeValue, dropdownsConfig) {
    if (period === 'reboot') {
        return '@reboot';
    }
    var newMonths = period === 'year' && months ? months : [];
    var newMonthDays = (period === 'year' || period === 'month') && monthDays ? monthDays : [];
    var newWeekDays = (period === 'year' || period === 'month' || period === 'week') && weekDays
        ? weekDays
        : [];
    var newHours = period !== 'minute' && period !== 'hour' && hours ? hours : [];
    var newMinutes = period !== 'minute' && minutes ? minutes : [];
    var parsedArray = parseCronArray([newMinutes, newHours, newMonthDays, newMonths, newWeekDays], humanizeValue, dropdownsConfig);
    return cronToString(parsedArray);
}
function partToString(cronPart, unit, humanize, leadingZero, clockFormat) {
    var retval = '';
    if (isFull(cronPart, unit) || cronPart.length === 0) {
        retval = '*';
    }
    else {
        var step = getStep(cronPart);
        if (step && isInterval(cronPart, step)) {
            if (isFullInterval(cronPart, unit, step)) {
                retval = "*/".concat(step);
            }
            else {
                retval = "".concat(formatValue(getMin(cronPart), unit, humanize, leadingZero, clockFormat), "-").concat(formatValue(getMax(cronPart), unit, humanize, leadingZero, clockFormat), "/").concat(step);
            }
        }
        else {
            retval = toRanges(cronPart)
                .map(function (range) {
                if (Array.isArray(range)) {
                    return "".concat(formatValue(range[0], unit, humanize, leadingZero, clockFormat), "-").concat(formatValue(range[1], unit, humanize, leadingZero, clockFormat));
                }
                return formatValue(range, unit, humanize, leadingZero, clockFormat);
            })
                .join(',');
        }
    }
    return retval;
}
function formatValue(value, unit, humanize, leadingZero, clockFormat) {
    var cronPartString = value.toString();
    var type = unit.type, alt = unit.alt, min = unit.min;
    var needLeadingZero = leadingZero && (leadingZero === true || leadingZero.includes(type));
    var need24HourClock = clockFormat === '24-hour-clock' && (type === 'hours' || type === 'minutes');
    if ((humanize && type === 'week-days') || (humanize && type === 'months')) {
        cronPartString = alt[value - min];
    }
    else if (value < 10 && (needLeadingZero || need24HourClock)) {
        cronPartString = cronPartString.padStart(2, '0');
    }
    if (type === 'hours' && clockFormat === '12-hour-clock') {
        var suffix = value >= 12 ? 'PM' : 'AM';
        var hour = value % 12 || 12;
        if (hour < 10 && needLeadingZero) {
            hour = hour.toString().padStart(2, '0');
        }
        cronPartString = "".concat(hour).concat(suffix);
    }
    return cronPartString;
}
function parsePartArray(arr, unit) {
    var values = sort(dedup(fixSunday(arr, unit)));
    if (values.length === 0) {
        return values;
    }
    var value = outOfRange(values, unit);
    if (typeof value !== 'undefined') {
        throw new Error("Value \"".concat(value, "\" out of range for ").concat(unit.type));
    }
    return values;
}
function parseCronArray(cronArr, humanizeValue, dropdownsConfig) {
    return cronArr.map(function (partArr, idx) {
        var _a;
        var unit = UNITS[idx];
        var parsedArray = parsePartArray(partArr, unit);
        var dropdownOption = dropdownsConfig === null || dropdownsConfig === void 0 ? void 0 : dropdownsConfig[unit.type];
        return partToString(parsedArray, unit, (_a = dropdownOption === null || dropdownOption === void 0 ? void 0 : dropdownOption.humanizeValue) !== null && _a !== void 0 ? _a : humanizeValue);
    });
}
function cronToString(parts) {
    return parts.join(' ');
}
function getPeriodFromCronParts(cronParts) {
    if (cronParts[3].length > 0) {
        return 'year';
    }
    else if (cronParts[2].length > 0) {
        return 'month';
    }
    else if (cronParts[4].length > 0) {
        return 'week';
    }
    else if (cronParts[1].length > 0) {
        return 'day';
    }
    else if (cronParts[0].length > 0) {
        return 'hour';
    }
    return 'minute';
}
function parseCronString(str) {
    if (typeof str !== 'string') {
        throw new Error('Invalid cron string');
    }
    var parts = str.replace(/\s+/g, ' ').trim().split(' ');
    if (parts.length === 5) {
        return parts.map(function (partStr, idx) {
            return parsePartString(partStr, UNITS[idx]);
        });
    }
    throw new Error('Invalid cron string format');
}
function parsePartString(str, unit) {
    if (str === '*' || str === '*/1') {
        return [];
    }
    var values = sort(dedup(fixSunday(replaceAlternatives(str, unit.min, unit.alt)
        .split(',')
        .map(function (value) {
        var valueParts = value.split('/');
        if (valueParts.length > 2) {
            throw new Error("Invalid value \"".concat(str, " for \"").concat(unit.type, "\""));
        }
        var parsedValues;
        var left = valueParts[0];
        var right = valueParts[1];
        if (left === '*') {
            parsedValues = range(unit.min, unit.max);
        }
        else {
            parsedValues = parseRange(left, str, unit);
        }
        var step = parseStep(right, unit);
        var intervalValues = applyInterval(parsedValues, step);
        return intervalValues;
    })
        .flat(), unit)));
    var value = outOfRange(values, unit);
    if (typeof value !== 'undefined') {
        throw new Error("Value \"".concat(value, "\" out of range for ").concat(unit.type));
    }
    if (values.length === unit.total) {
        return [];
    }
    return values;
}
function replaceAlternatives(str, min, alt) {
    if (alt) {
        str = str.toUpperCase();
        for (var i = 0; i < alt.length; i++) {
            str = str.replace(alt[i], "".concat(i + min));
        }
    }
    return str;
}
function fixSunday(values, unit) {
    if (unit.type === 'week-days') {
        values = values.map(function (value) {
            if (value === 7) {
                return 0;
            }
            return value;
        });
    }
    return values;
}
function parseRange(rangeStr, context, unit) {
    var subparts = rangeStr.split('-');
    if (subparts.length === 1) {
        var value = convertStringToNumber(subparts[0]);
        if (isNaN(value)) {
            throw new Error("Invalid value \"".concat(context, "\" for ").concat(unit.type));
        }
        return [value];
    }
    else if (subparts.length === 2) {
        var minValue = convertStringToNumber(subparts[0]);
        var maxValue = convertStringToNumber(subparts[1]);
        if (isNaN(minValue) || isNaN(maxValue)) {
            throw new Error("Invalid value \"".concat(context, "\" for ").concat(unit.type));
        }
        if (maxValue < minValue) {
            throw new Error("Max range is less than min range in \"".concat(rangeStr, "\" for ").concat(unit.type));
        }
        return range(minValue, maxValue);
    }
    else {
        throw new Error("Invalid value \"".concat(rangeStr, "\" for ").concat(unit.type));
    }
}
function outOfRange(values, unit) {
    var first = values[0];
    var last = values[values.length - 1];
    if (first < unit.min) {
        return first;
    }
    else if (last > unit.max) {
        return last;
    }
    return;
}
function parseStep(step, unit) {
    if (typeof step !== 'undefined') {
        var parsedStep = convertStringToNumber(step);
        if (isNaN(parsedStep) || parsedStep < 1) {
            throw new Error("Invalid interval step value \"".concat(step, "\" for ").concat(unit.type));
        }
        return parsedStep;
    }
}
function applyInterval(values, step) {
    if (step) {
        var minVal_1 = values[0];
        values = values.filter(function (value) {
            return value % step === minVal_1 % step || value === minVal_1;
        });
    }
    return values;
}
function isFull(values, unit) {
    return values.length === unit.max - unit.min + 1;
}
function getStep(values) {
    if (values.length > 2) {
        var step = values[1] - values[0];
        if (step > 1) {
            return step;
        }
    }
}
function isInterval(values, step) {
    for (var i = 1; i < values.length; i++) {
        var prev = values[i - 1];
        var value = values[i];
        if (value - prev !== step) {
            return false;
        }
    }
    return true;
}
function isFullInterval(values, unit, step) {
    var min = getMin(values);
    var max = getMax(values);
    var haveAllValues = values.length === (max - min) / step + 1;
    if (min === unit.min && max + step > unit.max && haveAllValues) {
        return true;
    }
    return false;
}
function getMin(values) {
    return values[0];
}
function getMax(values) {
    return values[values.length - 1];
}
function toRanges(values) {
    var retval = [];
    var startPart = null;
    values.forEach(function (value, index, self) {
        if (value !== self[index + 1] - 1) {
            if (startPart !== null) {
                retval.push([startPart, value]);
                startPart = null;
            }
            else {
                retval.push(value);
            }
        }
        else if (startPart === null) {
            startPart = value;
        }
    });
    return retval;
}

var converter = /*#__PURE__*/Object.freeze({
    __proto__: null,
    setValuesFromCronString: setValuesFromCronString,
    getCronStringFromValues: getCronStringFromValues,
    partToString: partToString,
    formatValue: formatValue,
    parsePartArray: parsePartArray
});

function CustomSelect(props) {
    var value = props.value, _a = props.grid, grid = _a === void 0 ? true : _a, optionsList = props.optionsList, setValue = props.setValue, locale = props.locale, className = props.className, humanizeLabels = props.humanizeLabels, disabled = props.disabled, readOnly = props.readOnly, leadingZero = props.leadingZero, clockFormat = props.clockFormat, period = props.period, unit = props.unit, periodicityOnDoubleClick = props.periodicityOnDoubleClick, mode = props.mode, allowClear = props.allowClear, _b = props.filterOption, filterOption = _b === void 0 ? function () { return true; } : _b, otherProps = __rest(props, ["value", "grid", "optionsList", "setValue", "locale", "className", "humanizeLabels", "disabled", "readOnly", "leadingZero", "clockFormat", "period", "unit", "periodicityOnDoubleClick", "mode", "allowClear", "filterOption"]);
    var stringValue = useMemo(function () {
        if (value && Array.isArray(value)) {
            return value.map(function (value) { return value.toString(); });
        }
    }, [value]);
    var options = useMemo(function () {
        if (optionsList) {
            return optionsList
                .map(function (option, index) {
                var number = unit.min === 0 ? index : index + 1;
                return {
                    value: number.toString(),
                    label: option,
                };
            })
                .filter(filterOption);
        }
        return __spreadArray([], Array(unit.total), true).map(function (e, index) {
            var number = unit.min === 0 ? index : index + 1;
            return {
                value: number.toString(),
                label: formatValue(number, unit, humanizeLabels, leadingZero, clockFormat),
            };
        })
            .filter(filterOption);
    }, [optionsList, leadingZero, humanizeLabels, clockFormat]);
    var localeJSON = JSON.stringify(locale);
    var renderTag = useCallback(function (props) {
        var itemValue = props.value;
        if (!value || value[0] !== Number(itemValue)) {
            return jsx(Fragment, {});
        }
        var parsedArray = parsePartArray(value, unit);
        var cronValue = partToString(parsedArray, unit, humanizeLabels, leadingZero, clockFormat);
        var testEveryValue = cronValue.match(/^\*\/([0-9]+),?/) || [];
        return (jsx("div", { children: testEveryValue[1]
                ? "".concat(locale.everyText || DEFAULT_LOCALE_EN.everyText, " ").concat(testEveryValue[1])
                : cronValue }));
    }, [value, localeJSON, humanizeLabels, leadingZero, clockFormat]);
    var simpleClick = useCallback(function (newValueOption) {
        var newValueOptions = Array.isArray(newValueOption)
            ? sort(newValueOption)
            : [newValueOption];
        var newValue = newValueOptions;
        if (value) {
            newValue = mode === 'single' ? [] : __spreadArray([], value, true);
            newValueOptions.forEach(function (o) {
                var newValueOptionNumber = Number(o);
                if (value.some(function (v) { return v === newValueOptionNumber; })) {
                    newValue = newValue.filter(function (v) { return v !== newValueOptionNumber; });
                }
                else {
                    newValue = sort(__spreadArray(__spreadArray([], newValue, true), [newValueOptionNumber], false));
                }
            });
        }
        if (newValue.length === unit.total) {
            setValue([]);
        }
        else {
            setValue(newValue);
        }
    }, [setValue, value]);
    var doubleClick = useCallback(function (newValueOption) {
        if (newValueOption !== 0 && newValueOption !== 1) {
            var limit = unit.total + unit.min;
            var newValue_1 = [];
            for (var i = unit.min; i < limit; i++) {
                if (i % newValueOption === 0) {
                    newValue_1.push(i);
                }
            }
            var oldValueEqualNewValue = value &&
                newValue_1 &&
                value.length === newValue_1.length &&
                value.every(function (v, i) { return v === newValue_1[i]; });
            var allValuesSelected = newValue_1.length === options.length;
            if (allValuesSelected) {
                setValue([]);
            }
            else if (oldValueEqualNewValue) {
                setValue([]);
            }
            else {
                setValue(newValue_1);
            }
        }
        else {
            setValue([]);
        }
    }, [value, options, setValue]);
    var clicksRef = useRef([]);
    var onOptionClick = useCallback(function (newValueOption) {
        if (!readOnly) {
            var doubleClickTimeout_1 = 300;
            var clicks_1 = clicksRef.current;
            clicks_1.push({
                time: new Date().getTime(),
                value: Number(newValueOption),
            });
            var id_1 = window.setTimeout(function () {
                if (periodicityOnDoubleClick &&
                    clicks_1.length > 1 &&
                    clicks_1[clicks_1.length - 1].time - clicks_1[clicks_1.length - 2].time <
                        doubleClickTimeout_1) {
                    if (clicks_1[clicks_1.length - 1].value ===
                        clicks_1[clicks_1.length - 2].value) {
                        doubleClick(Number(newValueOption));
                    }
                    else {
                        simpleClick([
                            clicks_1[clicks_1.length - 2].value,
                            clicks_1[clicks_1.length - 1].value,
                        ]);
                    }
                }
                else {
                    simpleClick(Number(newValueOption));
                }
                clicksRef.current = [];
            }, doubleClickTimeout_1);
            return function () {
                window.clearTimeout(id_1);
            };
        }
    }, [clicksRef, simpleClick, doubleClick, readOnly, periodicityOnDoubleClick]);
    var onClear = useCallback(function () {
        if (!readOnly) {
            setValue([]);
        }
    }, [setValue, readOnly]);
    var internalClassName = useMemo(function () {
        var _a;
        return classNames((_a = {
                'react-js-cron-select': true,
                'react-js-cron-custom-select': true
            },
            _a["".concat(className, "-select")] = !!className,
            _a));
    }, [className]);
    var popupClassName = useMemo(function () {
        var _a;
        return classNames((_a = {
                'react-js-cron-select-dropdown': true
            },
            _a["react-js-cron-select-dropdown-".concat(unit.type)] = true,
            _a['react-js-cron-custom-select-dropdown'] = true,
            _a["react-js-cron-custom-select-dropdown-".concat(unit.type)] = true,
            _a["react-js-cron-custom-select-dropdown-minutes-large"] = unit.type === 'minutes' && period !== 'hour' && period !== 'day',
            _a["react-js-cron-custom-select-dropdown-minutes-medium"] = unit.type === 'minutes' && (period === 'day' || period === 'hour'),
            _a['react-js-cron-custom-select-dropdown-hours-twelve-hour-clock'] = unit.type === 'hours' && clockFormat === '12-hour-clock',
            _a['react-js-cron-custom-select-dropdown-grid'] = !!grid,
            _a["".concat(className, "-select-dropdown")] = !!className,
            _a["".concat(className, "-select-dropdown-").concat(unit.type)] = !!className,
            _a));
    }, [className, grid, clockFormat, period]);
    return (jsx(TgSelect, __assign({ disallowClear: true, noToggle: true, mode: mode === 'single' && !periodicityOnDoubleClick ? undefined : 'multiple', allowClear: allowClear !== null && allowClear !== void 0 ? allowClear : !readOnly, virtual: false, open: readOnly ? false : undefined, value: stringValue, onClear: onClear, tagRender: renderTag, className: internalClassName, popupClassName: popupClassName, options: options, showSearch: false, suffixIcon: readOnly ? null : undefined, menuItemSelectedIcon: null, popupMatchSelectWidth: false, onSelect: onOptionClick, onDeselect: onOptionClick, disabled: disabled, dropdownAlign: (unit.type === 'minutes' || unit.type === 'hours') &&
            period !== 'day' &&
            period !== 'hour'
            ? {
                points: ['tr', 'br'],
            }
            : undefined, "data-testid": "custom-select-".concat(unit.type) }, otherProps)));
}

function Hours(props) {
    var value = props.value, setValue = props.setValue, locale = props.locale, className = props.className, disabled = props.disabled, readOnly = props.readOnly, leadingZero = props.leadingZero, clockFormat = props.clockFormat, period = props.period, periodicityOnDoubleClick = props.periodicityOnDoubleClick, mode = props.mode, allowClear = props.allowClear, filterOption = props.filterOption;
    var internalClassName = useMemo(function () {
        var _a;
        return classNames((_a = {
                'react-js-cron-field': true,
                'react-js-cron-hours': true
            },
            _a["".concat(className, "-field")] = !!className,
            _a["".concat(className, "-hours")] = !!className,
            _a));
    }, [className]);
    return (jsxs("div", __assign({ className: internalClassName }, { children: [locale.prefixHours !== '' && (jsx("span", { children: locale.prefixHours || DEFAULT_LOCALE_EN.prefixHours })), jsx(CustomSelect, { placeholder: locale.emptyHours || DEFAULT_LOCALE_EN.emptyHours, value: value, unit: UNITS[1], setValue: setValue, locale: locale, className: className, disabled: disabled, readOnly: readOnly, leadingZero: leadingZero, clockFormat: clockFormat, period: period, periodicityOnDoubleClick: periodicityOnDoubleClick, mode: mode, allowClear: allowClear, filterOption: filterOption })] })));
}

function Minutes(props) {
    var value = props.value, setValue = props.setValue, locale = props.locale, className = props.className, disabled = props.disabled, readOnly = props.readOnly, leadingZero = props.leadingZero, clockFormat = props.clockFormat, period = props.period, periodicityOnDoubleClick = props.periodicityOnDoubleClick, mode = props.mode, allowClear = props.allowClear, filterOption = props.filterOption;
    var internalClassName = useMemo(function () {
        var _a;
        return classNames((_a = {
                'react-js-cron-field': true,
                'react-js-cron-minutes': true
            },
            _a["".concat(className, "-field")] = !!className,
            _a["".concat(className, "-minutes")] = !!className,
            _a));
    }, [className]);
    return (jsxs("div", __assign({ className: internalClassName }, { children: [period === 'hour'
                ? locale.prefixMinutesForHourPeriod !== '' && (jsx("span", { children: locale.prefixMinutesForHourPeriod ||
                        DEFAULT_LOCALE_EN.prefixMinutesForHourPeriod }))
                : locale.prefixMinutes !== '' && (jsx("span", { children: locale.prefixMinutes || DEFAULT_LOCALE_EN.prefixMinutes })), jsx(CustomSelect, { placeholder: period === 'hour'
                    ? locale.emptyMinutesForHourPeriod ||
                        DEFAULT_LOCALE_EN.emptyMinutesForHourPeriod
                    : locale.emptyMinutes || DEFAULT_LOCALE_EN.emptyMinutes, value: value, unit: UNITS[0], setValue: setValue, locale: locale, className: className, disabled: disabled, readOnly: readOnly, leadingZero: leadingZero, clockFormat: clockFormat, period: period, periodicityOnDoubleClick: periodicityOnDoubleClick, mode: mode, allowClear: allowClear, filterOption: filterOption }), period === 'hour' && locale.suffixMinutesForHourPeriod !== '' && (jsx("span", { children: locale.suffixMinutesForHourPeriod ||
                    DEFAULT_LOCALE_EN.suffixMinutesForHourPeriod }))] })));
}

function MonthDays(props) {
    var value = props.value, setValue = props.setValue, locale = props.locale, className = props.className, weekDays = props.weekDays, disabled = props.disabled, readOnly = props.readOnly, leadingZero = props.leadingZero, period = props.period, periodicityOnDoubleClick = props.periodicityOnDoubleClick, mode = props.mode, allowClear = props.allowClear, filterOption = props.filterOption;
    var noWeekDays = !weekDays || weekDays.length === 0;
    var internalClassName = useMemo(function () {
        var _a;
        return classNames((_a = {
                'react-js-cron-field': true,
                'react-js-cron-month-days': true,
                'react-js-cron-month-days-placeholder': !noWeekDays
            },
            _a["".concat(className, "-field")] = !!className,
            _a["".concat(className, "-month-days")] = !!className,
            _a));
    }, [className, noWeekDays]);
    var localeJSON = JSON.stringify(locale);
    var placeholder = useMemo(function () {
        if (noWeekDays) {
            return locale.emptyMonthDays || DEFAULT_LOCALE_EN.emptyMonthDays;
        }
        return locale.emptyMonthDaysShort || DEFAULT_LOCALE_EN.emptyMonthDaysShort;
    }, [noWeekDays, localeJSON]);
    var displayMonthDays = !readOnly ||
        (value && value.length > 0) ||
        ((!value || value.length === 0) && (!weekDays || weekDays.length === 0));
    return displayMonthDays ? (jsxs("div", __assign({ className: internalClassName }, { children: [locale.prefixMonthDays !== '' && (jsx("span", { children: locale.prefixMonthDays || DEFAULT_LOCALE_EN.prefixMonthDays })), jsx(CustomSelect, { placeholder: placeholder, value: value, setValue: setValue, unit: UNITS[2], locale: locale, className: className, disabled: disabled, readOnly: readOnly, leadingZero: leadingZero, period: period, periodicityOnDoubleClick: periodicityOnDoubleClick, mode: mode, allowClear: allowClear, filterOption: filterOption })] }))) : null;
}

function Months(props) {
    var value = props.value, setValue = props.setValue, locale = props.locale, className = props.className, humanizeLabels = props.humanizeLabels, disabled = props.disabled, readOnly = props.readOnly, period = props.period, periodicityOnDoubleClick = props.periodicityOnDoubleClick, mode = props.mode, allowClear = props.allowClear, filterOption = props.filterOption;
    var optionsList = locale.months || DEFAULT_LOCALE_EN.months;
    var internalClassName = useMemo(function () {
        var _a;
        return classNames((_a = {
                'react-js-cron-field': true,
                'react-js-cron-months': true
            },
            _a["".concat(className, "-field")] = !!className,
            _a["".concat(className, "-months")] = !!className,
            _a));
    }, [className]);
    return (jsxs("div", __assign({ className: internalClassName }, { children: [locale.prefixMonths !== '' && (jsx("span", { children: locale.prefixMonths || DEFAULT_LOCALE_EN.prefixMonths })), jsx(CustomSelect, { placeholder: locale.emptyMonths || DEFAULT_LOCALE_EN.emptyMonths, optionsList: optionsList, grid: false, value: value, unit: __assign(__assign({}, UNITS[3]), { alt: locale.altMonths || DEFAULT_LOCALE_EN.altMonths }), setValue: setValue, locale: locale, className: className, humanizeLabels: humanizeLabels, disabled: disabled, readOnly: readOnly, period: period, periodicityOnDoubleClick: periodicityOnDoubleClick, mode: mode, allowClear: allowClear, filterOption: filterOption })] })));
}

function Period(props) {
    var value = props.value, setValue = props.setValue, locale = props.locale, className = props.className, disabled = props.disabled, readOnly = props.readOnly, shortcuts = props.shortcuts, allowedPeriods = props.allowedPeriods, allowClear = props.allowClear;
    var options = [];
    if (allowedPeriods.includes('year')) {
        options.push({
            value: 'year',
            label: locale.yearOption || DEFAULT_LOCALE_EN.yearOption,
        });
    }
    if (allowedPeriods.includes('month')) {
        options.push({
            value: 'month',
            label: locale.monthOption || DEFAULT_LOCALE_EN.monthOption,
        });
    }
    if (allowedPeriods.includes('week')) {
        options.push({
            value: 'week',
            label: locale.weekOption || DEFAULT_LOCALE_EN.weekOption,
        });
    }
    if (allowedPeriods.includes('day')) {
        options.push({
            value: 'day',
            label: locale.dayOption || DEFAULT_LOCALE_EN.dayOption,
        });
    }
    if (allowedPeriods.includes('hour')) {
        options.push({
            value: 'hour',
            label: locale.hourOption || DEFAULT_LOCALE_EN.hourOption,
        });
    }
    if (allowedPeriods.includes('minute')) {
        options.push({
            value: 'minute',
            label: locale.minuteOption || DEFAULT_LOCALE_EN.minuteOption,
        });
    }
    if (allowedPeriods.includes('reboot') &&
        shortcuts &&
        (shortcuts === true || shortcuts.includes('@reboot'))) {
        options.push({
            value: 'reboot',
            label: locale.rebootOption || DEFAULT_LOCALE_EN.rebootOption,
        });
    }
    var handleChange = useCallback(function (newValue) {
        if (!readOnly) {
            setValue(newValue);
        }
    }, [setValue, readOnly]);
    var internalClassName = useMemo(function () {
        var _a;
        return classNames((_a = {
                'react-js-cron-field': true,
                'react-js-cron-period': true
            },
            _a["".concat(className, "-field")] = !!className,
            _a["".concat(className, "-period")] = !!className,
            _a));
    }, [className]);
    var selectClassName = useMemo(function () {
        var _a;
        return classNames((_a = {
                'react-js-cron-select': true,
                'react-js-cron-select-no-prefix': locale.prefixPeriod === ''
            },
            _a["".concat(className, "-select")] = !!className,
            _a));
    }, [className, locale.prefixPeriod]);
    var popupClassName = useMemo(function () {
        var _a;
        return classNames((_a = {
                'react-js-cron-select-dropdown': true,
                'react-js-cron-select-dropdown-period': true
            },
            _a["".concat(className, "-select-dropdown")] = !!className,
            _a["".concat(className, "-select-dropdown-period")] = !!className,
            _a));
    }, [className]);
    return (jsxs("div", __assign({ className: internalClassName }, { children: [locale.prefixPeriod !== '' && (jsx("span", { children: locale.prefixPeriod || DEFAULT_LOCALE_EN.prefixPeriod })), jsx(TgSelect, { disallowClear: true, noToggle: true, defaultValue: value, value: value, onChange: handleChange, options: options, className: selectClassName, popupClassName: popupClassName, disabled: disabled, suffixIcon: readOnly ? null : undefined, open: readOnly ? false : undefined, "data-testid": 'select-period', allowClear: allowClear }, JSON.stringify(locale))] })));
}

function WeekDays(props) {
    var value = props.value, setValue = props.setValue, locale = props.locale, className = props.className, humanizeLabels = props.humanizeLabels, monthDays = props.monthDays, disabled = props.disabled, readOnly = props.readOnly, period = props.period, periodicityOnDoubleClick = props.periodicityOnDoubleClick, mode = props.mode, allowClear = props.allowClear, filterOption = props.filterOption;
    var optionsList = locale.weekDays || DEFAULT_LOCALE_EN.weekDays;
    var noMonthDays = period === 'week' || !monthDays || monthDays.length === 0;
    var internalClassName = useMemo(function () {
        var _a;
        return classNames((_a = {
                'react-js-cron-field': true,
                'react-js-cron-week-days': true,
                'react-js-cron-week-days-placeholder': !noMonthDays
            },
            _a["".concat(className, "-field")] = !!className,
            _a["".concat(className, "-week-days")] = !!className,
            _a));
    }, [className, noMonthDays]);
    var localeJSON = JSON.stringify(locale);
    var placeholder = useMemo(function () {
        if (noMonthDays) {
            return locale.emptyWeekDays || DEFAULT_LOCALE_EN.emptyWeekDays;
        }
        return locale.emptyWeekDaysShort || DEFAULT_LOCALE_EN.emptyWeekDaysShort;
    }, [noMonthDays, localeJSON]);
    var displayWeekDays = period === 'week' ||
        !readOnly ||
        (value && value.length > 0) ||
        ((!value || value.length === 0) && (!monthDays || monthDays.length === 0));
    var monthDaysIsDisplayed = !readOnly ||
        (monthDays && monthDays.length > 0) ||
        ((!monthDays || monthDays.length === 0) && (!value || value.length === 0));
    return displayWeekDays ? (jsxs("div", __assign({ className: internalClassName }, { children: [locale.prefixWeekDays !== '' &&
                (period === 'week' || !monthDaysIsDisplayed) && (jsx("span", { children: locale.prefixWeekDays || DEFAULT_LOCALE_EN.prefixWeekDays })), locale.prefixWeekDaysForMonthAndYearPeriod !== '' &&
                period !== 'week' &&
                monthDaysIsDisplayed && (jsx("span", { children: locale.prefixWeekDaysForMonthAndYearPeriod ||
                    DEFAULT_LOCALE_EN.prefixWeekDaysForMonthAndYearPeriod })), jsx(CustomSelect, { placeholder: placeholder, optionsList: optionsList, grid: false, value: value, unit: __assign(__assign({}, UNITS[4]), { alt: locale.altWeekDays || DEFAULT_LOCALE_EN.altWeekDays }), setValue: setValue, locale: locale, className: className, humanizeLabels: humanizeLabels, disabled: disabled, readOnly: readOnly, period: period, periodicityOnDoubleClick: periodicityOnDoubleClick, mode: mode, allowClear: allowClear, filterOption: filterOption })] }))) : null;
}

function Cron(props) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32, _33, _34, _35, _36, _37, _38, _39, _40, _41, _42, _43, _44, _45, _46;
    var _47 = props.clearButton, clearButton = _47 === void 0 ? true : _47, _48 = props.clearButtonProps, clearButtonProps = _48 === void 0 ? {} : _48, _49 = props.clearButtonAction, clearButtonAction = _49 === void 0 ? 'fill-with-every' : _49, _50 = props.locale, locale = _50 === void 0 ? DEFAULT_LOCALE_EN : _50, _51 = props.value, value = _51 === void 0 ? '' : _51, setValue = props.setValue, _52 = props.displayError, displayError = _52 === void 0 ? true : _52, onError = props.onError, className = props.className, _53 = props.defaultPeriod, defaultPeriod = _53 === void 0 ? 'day' : _53, _54 = props.allowEmpty, allowEmpty = _54 === void 0 ? 'for-default-value' : _54, _55 = props.humanizeLabels, humanizeLabels = _55 === void 0 ? true : _55, _56 = props.humanizeValue, humanizeValue = _56 === void 0 ? false : _56, _57 = props.disabled, disabled = _57 === void 0 ? false : _57, _58 = props.readOnly, readOnly = _58 === void 0 ? false : _58, _59 = props.leadingZero, leadingZero = _59 === void 0 ? false : _59, _60 = props.shortcuts, shortcuts = _60 === void 0 ? [
        '@yearly',
        '@annually',
        '@monthly',
        '@weekly',
        '@daily',
        '@midnight',
        '@hourly',
    ] : _60, clockFormat = props.clockFormat, _61 = props.periodicityOnDoubleClick, periodicityOnDoubleClick = _61 === void 0 ? true : _61, _62 = props.mode, mode = _62 === void 0 ? 'multiple' : _62, _63 = props.allowedDropdowns, allowedDropdowns = _63 === void 0 ? [
        'period',
        'months',
        'month-days',
        'week-days',
        'hours',
        'minutes',
    ] : _63, _64 = props.allowedPeriods, allowedPeriods = _64 === void 0 ? [
        'year',
        'month',
        'week',
        'day',
        'hour',
        'minute',
        'reboot',
    ] : _64, allowClear = props.allowClear, dropdownsConfig = props.dropdownsConfig;
    var internalValueRef = useRef(value);
    var defaultPeriodRef = useRef(defaultPeriod);
    var _65 = useState(), period = _65[0], setPeriod = _65[1];
    var _66 = useState(), monthDays = _66[0], setMonthDays = _66[1];
    var _67 = useState(), months = _67[0], setMonths = _67[1];
    var _68 = useState(), weekDays = _68[0], setWeekDays = _68[1];
    var _69 = useState(), hours = _69[0], setHours = _69[1];
    var _70 = useState(), minutes = _70[0], setMinutes = _70[1];
    var _71 = useState(false), error = _71[0], setInternalError = _71[1];
    var _72 = useState(false), valueCleared = _72[0], setValueCleared = _72[1];
    var previousValueCleared = usePrevious(valueCleared);
    var localeJSON = JSON.stringify(locale);
    useEffect(function () {
        setValuesFromCronString(value, setInternalError, onError, allowEmpty, internalValueRef, true, locale, shortcuts, setMinutes, setHours, setMonthDays, setMonths, setWeekDays, setPeriod);
    }, []);
    useEffect(function () {
        if (value !== internalValueRef.current) {
            setValuesFromCronString(value, setInternalError, onError, allowEmpty, internalValueRef, false, locale, shortcuts, setMinutes, setHours, setMonthDays, setMonths, setWeekDays, setPeriod);
        }
    }, [value, internalValueRef, localeJSON, allowEmpty, shortcuts]);
    useEffect(function () {
        if ((period || minutes || months || monthDays || weekDays || hours) &&
            !valueCleared &&
            !previousValueCleared) {
            var selectedPeriod = period || defaultPeriodRef.current;
            var cron = getCronStringFromValues(selectedPeriod, months, monthDays, weekDays, hours, minutes, humanizeValue, dropdownsConfig);
            setValue(cron, { selectedPeriod: selectedPeriod });
            internalValueRef.current = cron;
            onError && onError(undefined);
            setInternalError(false);
        }
        else if (valueCleared) {
            setValueCleared(false);
        }
    }, [
        period,
        monthDays,
        months,
        weekDays,
        hours,
        minutes,
        humanizeValue,
        valueCleared,
        dropdownsConfig,
    ]);
    var handleClear = useCallback(function () {
        setMonthDays(undefined);
        setMonths(undefined);
        setWeekDays(undefined);
        setHours(undefined);
        setMinutes(undefined);
        var newValue = '';
        var newPeriod = period !== 'reboot' && period ? period : defaultPeriodRef.current;
        if (newPeriod !== period) {
            setPeriod(newPeriod);
        }
        if (clearButtonAction === 'fill-with-every') {
            var cron = getCronStringFromValues(newPeriod, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
            newValue = cron;
        }
        setValue(newValue, { selectedPeriod: newPeriod });
        internalValueRef.current = newValue;
        setValueCleared(true);
        if (allowEmpty === 'never' && clearButtonAction === 'empty') {
            setInternalError(true);
            setError(onError, locale);
        }
        else {
            onError && onError(undefined);
            setInternalError(false);
        }
    }, [period, setValue, onError, clearButtonAction]);
    var internalClassName = useMemo(function () {
        var _a;
        return classNames((_a = {
                'react-js-cron': true,
                'react-js-cron-error': error && displayError,
                'react-js-cron-disabled': disabled,
                'react-js-cron-read-only': readOnly
            },
            _a["".concat(className)] = !!className,
            _a["".concat(className, "-error")] = error && displayError && !!className,
            _a["".concat(className, "-disabled")] = disabled && !!className,
            _a["".concat(className, "-read-only")] = readOnly && !!className,
            _a));
    }, [className, error, displayError, disabled, readOnly]);
    var clearButtonClassNameProp = clearButtonProps.className, otherClearButtonProps = __rest(clearButtonProps, ["className"]);
    var clearButtonClassName = useMemo(function () {
        var _a;
        return classNames((_a = {
                'react-js-cron-clear-button': true
            },
            _a["".concat(className, "-clear-button")] = !!className,
            _a["".concat(clearButtonClassNameProp)] = !!clearButtonClassNameProp,
            _a));
    }, [className, clearButtonClassNameProp]);
    var otherClearButtonPropsJSON = JSON.stringify(otherClearButtonProps);
    var clearButtonNode = useMemo(function () {
        if (clearButton && !readOnly) {
            return (jsx(Button, __assign({ className: clearButtonClassName, danger: true, type: 'primary', disabled: disabled }, otherClearButtonProps, { onClick: handleClear }, { children: locale.clearButtonText || DEFAULT_LOCALE_EN.clearButtonText })));
        }
        return null;
    }, [
        clearButton,
        readOnly,
        localeJSON,
        clearButtonClassName,
        disabled,
        otherClearButtonPropsJSON,
        handleClear,
    ]);
    var periodForRender = period || defaultPeriodRef.current;
    return (jsxs("div", __assign({ className: internalClassName }, { children: [allowedDropdowns.includes('period') && (jsx(Period, { value: periodForRender, setValue: setPeriod, locale: locale, className: className, disabled: (_b = (_a = dropdownsConfig === null || dropdownsConfig === void 0 ? void 0 : dropdownsConfig.period) === null || _a === void 0 ? void 0 : _a.disabled) !== null && _b !== void 0 ? _b : disabled, readOnly: (_d = (_c = dropdownsConfig === null || dropdownsConfig === void 0 ? void 0 : dropdownsConfig.period) === null || _c === void 0 ? void 0 : _c.readOnly) !== null && _d !== void 0 ? _d : readOnly, shortcuts: shortcuts, allowedPeriods: allowedPeriods, allowClear: (_f = (_e = dropdownsConfig === null || dropdownsConfig === void 0 ? void 0 : dropdownsConfig.period) === null || _e === void 0 ? void 0 : _e.allowClear) !== null && _f !== void 0 ? _f : allowClear })), periodForRender === 'reboot' ? (clearButtonNode) : (jsxs(Fragment, { children: [periodForRender === 'year' &&
                        allowedDropdowns.includes('months') && (jsx(Months, { value: months, setValue: setMonths, locale: locale, className: className, humanizeLabels: (_h = (_g = dropdownsConfig === null || dropdownsConfig === void 0 ? void 0 : dropdownsConfig.months) === null || _g === void 0 ? void 0 : _g.humanizeLabels) !== null && _h !== void 0 ? _h : humanizeLabels, disabled: (_k = (_j = dropdownsConfig === null || dropdownsConfig === void 0 ? void 0 : dropdownsConfig.months) === null || _j === void 0 ? void 0 : _j.disabled) !== null && _k !== void 0 ? _k : disabled, readOnly: (_m = (_l = dropdownsConfig === null || dropdownsConfig === void 0 ? void 0 : dropdownsConfig.months) === null || _l === void 0 ? void 0 : _l.readOnly) !== null && _m !== void 0 ? _m : readOnly, period: periodForRender, periodicityOnDoubleClick: (_p = (_o = dropdownsConfig === null || dropdownsConfig === void 0 ? void 0 : dropdownsConfig.months) === null || _o === void 0 ? void 0 : _o.periodicityOnDoubleClick) !== null && _p !== void 0 ? _p : periodicityOnDoubleClick, mode: (_r = (_q = dropdownsConfig === null || dropdownsConfig === void 0 ? void 0 : dropdownsConfig.months) === null || _q === void 0 ? void 0 : _q.mode) !== null && _r !== void 0 ? _r : mode, allowClear: (_t = (_s = dropdownsConfig === null || dropdownsConfig === void 0 ? void 0 : dropdownsConfig.months) === null || _s === void 0 ? void 0 : _s.allowClear) !== null && _t !== void 0 ? _t : allowClear, filterOption: (_u = dropdownsConfig === null || dropdownsConfig === void 0 ? void 0 : dropdownsConfig.months) === null || _u === void 0 ? void 0 : _u.filterOption })), (periodForRender === 'year' || periodForRender === 'month') &&
                        allowedDropdowns.includes('month-days') && (jsx(MonthDays, { value: monthDays, setValue: setMonthDays, locale: locale, className: className, weekDays: weekDays, disabled: (_w = (_v = dropdownsConfig === null || dropdownsConfig === void 0 ? void 0 : dropdownsConfig['month-days']) === null || _v === void 0 ? void 0 : _v.disabled) !== null && _w !== void 0 ? _w : disabled, readOnly: (_y = (_x = dropdownsConfig === null || dropdownsConfig === void 0 ? void 0 : dropdownsConfig['month-days']) === null || _x === void 0 ? void 0 : _x.readOnly) !== null && _y !== void 0 ? _y : readOnly, leadingZero: (_0 = (_z = dropdownsConfig === null || dropdownsConfig === void 0 ? void 0 : dropdownsConfig['month-days']) === null || _z === void 0 ? void 0 : _z.leadingZero) !== null && _0 !== void 0 ? _0 : leadingZero, period: periodForRender, periodicityOnDoubleClick: (_2 = (_1 = dropdownsConfig === null || dropdownsConfig === void 0 ? void 0 : dropdownsConfig['month-days']) === null || _1 === void 0 ? void 0 : _1.periodicityOnDoubleClick) !== null && _2 !== void 0 ? _2 : periodicityOnDoubleClick, mode: (_4 = (_3 = dropdownsConfig === null || dropdownsConfig === void 0 ? void 0 : dropdownsConfig['month-days']) === null || _3 === void 0 ? void 0 : _3.mode) !== null && _4 !== void 0 ? _4 : mode, allowClear: (_6 = (_5 = dropdownsConfig === null || dropdownsConfig === void 0 ? void 0 : dropdownsConfig['month-days']) === null || _5 === void 0 ? void 0 : _5.allowClear) !== null && _6 !== void 0 ? _6 : allowClear, filterOption: (_7 = dropdownsConfig === null || dropdownsConfig === void 0 ? void 0 : dropdownsConfig['month-days']) === null || _7 === void 0 ? void 0 : _7.filterOption })), (periodForRender === 'year' ||
                        periodForRender === 'month' ||
                        periodForRender === 'week') &&
                        allowedDropdowns.includes('week-days') && (jsx(WeekDays, { value: weekDays, setValue: setWeekDays, locale: locale, className: className, humanizeLabels: (_9 = (_8 = dropdownsConfig === null || dropdownsConfig === void 0 ? void 0 : dropdownsConfig['week-days']) === null || _8 === void 0 ? void 0 : _8.humanizeLabels) !== null && _9 !== void 0 ? _9 : humanizeLabels, monthDays: monthDays, disabled: (_11 = (_10 = dropdownsConfig === null || dropdownsConfig === void 0 ? void 0 : dropdownsConfig['week-days']) === null || _10 === void 0 ? void 0 : _10.disabled) !== null && _11 !== void 0 ? _11 : disabled, readOnly: (_13 = (_12 = dropdownsConfig === null || dropdownsConfig === void 0 ? void 0 : dropdownsConfig['week-days']) === null || _12 === void 0 ? void 0 : _12.readOnly) !== null && _13 !== void 0 ? _13 : readOnly, period: periodForRender, periodicityOnDoubleClick: (_15 = (_14 = dropdownsConfig === null || dropdownsConfig === void 0 ? void 0 : dropdownsConfig['week-days']) === null || _14 === void 0 ? void 0 : _14.periodicityOnDoubleClick) !== null && _15 !== void 0 ? _15 : periodicityOnDoubleClick, mode: (_17 = (_16 = dropdownsConfig === null || dropdownsConfig === void 0 ? void 0 : dropdownsConfig['week-days']) === null || _16 === void 0 ? void 0 : _16.mode) !== null && _17 !== void 0 ? _17 : mode, allowClear: (_19 = (_18 = dropdownsConfig === null || dropdownsConfig === void 0 ? void 0 : dropdownsConfig['week-days']) === null || _18 === void 0 ? void 0 : _18.allowClear) !== null && _19 !== void 0 ? _19 : allowClear, filterOption: (_20 = dropdownsConfig === null || dropdownsConfig === void 0 ? void 0 : dropdownsConfig['week-days']) === null || _20 === void 0 ? void 0 : _20.filterOption })), jsxs("div", { children: [periodForRender !== 'minute' &&
                                periodForRender !== 'hour' &&
                                allowedDropdowns.includes('hours') && (jsx(Hours, { value: hours, setValue: setHours, locale: locale, className: className, disabled: (_22 = (_21 = dropdownsConfig === null || dropdownsConfig === void 0 ? void 0 : dropdownsConfig.hours) === null || _21 === void 0 ? void 0 : _21.disabled) !== null && _22 !== void 0 ? _22 : disabled, readOnly: (_24 = (_23 = dropdownsConfig === null || dropdownsConfig === void 0 ? void 0 : dropdownsConfig.hours) === null || _23 === void 0 ? void 0 : _23.readOnly) !== null && _24 !== void 0 ? _24 : readOnly, leadingZero: (_26 = (_25 = dropdownsConfig === null || dropdownsConfig === void 0 ? void 0 : dropdownsConfig.hours) === null || _25 === void 0 ? void 0 : _25.leadingZero) !== null && _26 !== void 0 ? _26 : leadingZero, clockFormat: clockFormat, period: periodForRender, periodicityOnDoubleClick: (_28 = (_27 = dropdownsConfig === null || dropdownsConfig === void 0 ? void 0 : dropdownsConfig.hours) === null || _27 === void 0 ? void 0 : _27.periodicityOnDoubleClick) !== null && _28 !== void 0 ? _28 : periodicityOnDoubleClick, mode: (_30 = (_29 = dropdownsConfig === null || dropdownsConfig === void 0 ? void 0 : dropdownsConfig.hours) === null || _29 === void 0 ? void 0 : _29.mode) !== null && _30 !== void 0 ? _30 : mode, allowClear: (_32 = (_31 = dropdownsConfig === null || dropdownsConfig === void 0 ? void 0 : dropdownsConfig.hours) === null || _31 === void 0 ? void 0 : _31.allowClear) !== null && _32 !== void 0 ? _32 : allowClear, filterOption: (_33 = dropdownsConfig === null || dropdownsConfig === void 0 ? void 0 : dropdownsConfig.hours) === null || _33 === void 0 ? void 0 : _33.filterOption })), periodForRender !== 'minute' &&
                                allowedDropdowns.includes('minutes') && (jsx(Minutes, { value: minutes, setValue: setMinutes, locale: locale, period: periodForRender, className: className, disabled: (_35 = (_34 = dropdownsConfig === null || dropdownsConfig === void 0 ? void 0 : dropdownsConfig.minutes) === null || _34 === void 0 ? void 0 : _34.disabled) !== null && _35 !== void 0 ? _35 : disabled, readOnly: (_37 = (_36 = dropdownsConfig === null || dropdownsConfig === void 0 ? void 0 : dropdownsConfig.minutes) === null || _36 === void 0 ? void 0 : _36.readOnly) !== null && _37 !== void 0 ? _37 : readOnly, leadingZero: (_39 = (_38 = dropdownsConfig === null || dropdownsConfig === void 0 ? void 0 : dropdownsConfig.minutes) === null || _38 === void 0 ? void 0 : _38.leadingZero) !== null && _39 !== void 0 ? _39 : leadingZero, clockFormat: clockFormat, periodicityOnDoubleClick: (_41 = (_40 = dropdownsConfig === null || dropdownsConfig === void 0 ? void 0 : dropdownsConfig.minutes) === null || _40 === void 0 ? void 0 : _40.periodicityOnDoubleClick) !== null && _41 !== void 0 ? _41 : periodicityOnDoubleClick, mode: (_43 = (_42 = dropdownsConfig === null || dropdownsConfig === void 0 ? void 0 : dropdownsConfig.minutes) === null || _42 === void 0 ? void 0 : _42.mode) !== null && _43 !== void 0 ? _43 : mode, allowClear: (_45 = (_44 = dropdownsConfig === null || dropdownsConfig === void 0 ? void 0 : dropdownsConfig.minutes) === null || _44 === void 0 ? void 0 : _44.allowClear) !== null && _45 !== void 0 ? _45 : allowClear, filterOption: (_46 = dropdownsConfig === null || dropdownsConfig === void 0 ? void 0 : dropdownsConfig.minutes) === null || _46 === void 0 ? void 0 : _46.filterOption })), clearButtonNode] })] }))] })));
}

export { Cron, converter, Cron as default };
