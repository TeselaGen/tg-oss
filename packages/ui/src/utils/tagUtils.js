import { flatMap, keyBy } from "lodash-es";
import determineBlackOrWhiteTextColor from "./determineBlackOrWhiteTextColor";

export function getTagsAndTagOptions(allTags) {
  return flatMap(allTags, tag => {
    if (tag.tagOptions && tag.tagOptions.length) {
      return tag.tagOptions.map(tagO => {
        const fullname = `${tag.name}: ${tagO.name}`;
        const value = `${tag.id}:${tagO.id}`;
        return {
          ...tagO,
          label: fullname,
          value,
          id: tagO.id
        };
      });
    }
    return {
      ...tag,
      label: tag.name,
      value: tag.id
    };
  });
}

export function getKeyedTagsAndTagOptions(tags) {
  return keyBy(getTagsAndTagOptions(tags), "value");
}

export function getTagColorStyle(color) {
  return color
    ? {
        style: {
          backgroundColor: color,
          color: determineBlackOrWhiteTextColor(color)
        }
      }
    : {};
}
export function getTagProps({ color, label, name }) {
  return {
    ...getTagColorStyle(color),
    children: label || name
  };
}
