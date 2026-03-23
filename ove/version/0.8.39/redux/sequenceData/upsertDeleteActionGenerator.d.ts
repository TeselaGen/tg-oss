export default function upsertDeleteActionGenerator(upsertAction: any, deleteAction: any): {
    [x: number]: (state: any, payload: any) => any;
};
