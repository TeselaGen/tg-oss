import VersionHistoryView from "../../src/VersionHistoryView";

export default () => {
  return (
    <div>
      <VersionHistoryView
        onSave={() => {
          window.alert("onSave triggered!");
          // console.info("onSave triggered:", args);
        }}
        exitVersionHistoryView={() => {
          window.alert("exit requested!");
        }}
        getSequenceAtVersion={versionId => {
          // in a real version we'd go to server and get a real sequence based on the version id
          // const seq = await api.getSeqAtVersion()
          // return seq
          if (versionId === 2) {
            return {
              sequence: "thomaswashere"
            };
          } else if (versionId === 3) {
            return {
              features: [{ start: 4, end: 6 }],
              sequence:
                "GGGAAAagagagtgagagagtagagagagaccacaccccccGGGAAAagagagtgagagagtagagagagaccacaccccccGGGAAAagagagtgagagagtagagagagaccacaccccccGGGAAAagagagtgagagagtagagagagaccacacccccc"
            };
          } else {
            console.error("we shouldn't be here...");
            return {
              sequence: "taa"
            };
          }
        }}
        getVersionList={() => {
          //fake talking to some api
          return new Promise(resolve => {
            setTimeout(() => {
              resolve([
                {
                  dateChanged: "12/30/2211",
                  editedBy: "Nara",
                  // revisionType: "Sequence Deletion",
                  versionId: 2
                },
                {
                  dateChanged: "8/30/2211",
                  editedBy: "Ralph",
                  // revisionType: "Feature Edit",
                  versionId: 3
                }
              ]);
            }, 100);
          });
        }}
      />
    </div>
  );
};
