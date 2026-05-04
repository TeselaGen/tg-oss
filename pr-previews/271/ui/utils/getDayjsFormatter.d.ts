export default function getDayjsFormatter(format: any): {
    formatDate: (date: any) => string;
    parseDate: (str: any) => Date;
    placeholder: any;
};
