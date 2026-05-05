export function getTagsAndTagOptions(allTags: any): any[];
export function getKeyedTagsAndTagOptions(tags: any): import('lodash').Dictionary<any>;
export function getTagColorStyle(color: any): {
    style: {
        backgroundColor: any;
        color: string;
    };
} | {
    style?: undefined;
};
export function getTagProps({ color, label, name }: {
    color: any;
    label: any;
    name: any;
}): {
    children: any;
    style: {
        backgroundColor: any;
        color: string;
    };
} | {
    children: any;
    style?: undefined;
};
