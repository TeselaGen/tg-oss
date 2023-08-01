describe("import", function () {
  beforeEach(() => {
    cy.visit("");
  });
  it("import tool should be able to import a genbank file", function () {
    cy.get(".veCircularView");
    cy.get(".veLinearView").should("not.exist");
    cy.uploadFile(`[data-test="veImportTool"]`, "pj5_00002.gb");
    cy.contains("Sequence Imported");
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(100);
    cy.contains("onSave Callback").should("not.exist");
    //circular view should still be focused
    cy.get(".veCircularView");
    cy.get(".veLinearView").should("not.exist");
  });

  it("import tool should be able to import a genbank file containing ds-RNA file", function () {
    cy.get(".veCircularView");
    cy.get(".veLinearView").should("not.exist");
    cy.contains("gacgucuuaugacaacuugagggggggggg").should("not.exist");
    cy.uploadFile(`[data-test="veImportTool"]`, "RNA_double_stranded.gb");
    cy.contains("Sequence Imported");
    cy.contains("gacgucuuaugacaacuugagggggggggg");
    cy.contains("cugcagaauacuguugaacucccccccccc");
  });

  it("import tool should be able to import a genbank file containing ss-RNA file", function () {
    cy.get(".veCircularView");
    cy.get(".veLinearView").should("not.exist");
    cy.contains("gacgucuuaugacaacuugagggggggggg").should("not.exist");
    cy.uploadFile(`[data-test="veImportTool"]`, "RNA_single_stranded.gb");
    cy.contains("Sequence Imported");
    cy.contains("gacgucuuaugacaacuugagggggggggg");
    cy.contains("cugcagaauacuguugaacucccccccccc").should("not.exist");
  });

  it("import tool should be able to import a genbank file containing ds-DNA file", function () {
    cy.get(".veCircularView");
    cy.get(".veLinearView").should("not.exist");
    cy.contains("gacgtcttatgacaacttgagggggggggg").should("not.exist");
    cy.uploadFile(`[data-test="veImportTool"]`, "DNA_double_stranded.gb");
    cy.contains("Sequence Imported");
    cy.contains("gacgtcttatgacaacttgagggggggggg");
    cy.contains("ctgcagaatactgttgaactcccccccccc");
  });

  it("import tool should be able to import a genbank file containing ss-DNA file", function () {
    cy.get(".veCircularView");
    cy.get(".veLinearView").should("not.exist");
    cy.contains("gacgtcttatgacaacttgagggggggggg").should("not.exist");
    cy.uploadFile(`[data-test="veImportTool"]`, "DNA_single_stranded.gb");
    cy.contains("Sequence Imported");
    cy.contains("gacgtcttatgacaacttgagggggggggg");
    cy.contains("ctgcagaatactgttgaactcccccccccc").should("not.exist");
  });

  it("import tool should be able to import a genpep file", function () {
    cy.get(".veCircularView");
    cy.get(".veRowItemSequenceContainer");
    cy.get(`.veRowViewPrimaryProteinSequenceContainer`).should("not.exist");
    cy.uploadFile(`[data-test="veImportTool"]`, "3DHZ_B.gp");
    cy.contains("Sequence Imported");
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(100);
    cy.contains("onSave Callback").should("not.exist");
    //linear view should be focused by default
    cy.get(".veLinearView");
    cy.get(".veCircularView").should("not.exist");
    //AA's should show up be default
    cy.get(`.veRowViewPrimaryProteinSequenceContainer`);
  });
  it("import tool should be able to import a genbank file, it should trigger the save function if shouldAutosave=true", function () {
    cy.tgToggle("shouldAutosave");
    cy.uploadFile(`[data-test="veImportTool"]`, "pj5_00002.gb");
    cy.contains("Sequence Imported");
    cy.contains("onSave callback triggered");
  });
  it("importing multiple files should pop up a dialog to allow users to choose which sequence they'd like to focus on", function () {
    cy.uploadFile(`[data-test="veImportTool"]`, "multiseq.gb");
    cy.contains("Sequence Imported").should("not.exist");
    cy.contains(
      "Multiple sequences were detected in the input file. Please choose one to continue"
    );
    cy.contains("109 bps");
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(200);
    cy.contains("sequence2").click();
    cy.contains("RFP cassette");
    cy.contains(`.bp3-dialog button`, "Select").click();
    cy.contains("Sequence Imported");
    cy.contains("Length: 171 bps");
  });
  it("import tool should be able to import a snapgene .dna file", function () {
    cy.uploadFile(`[data-test="veImportTool"]`, "addgene-plasmid.dna");
    cy.contains("Sequence Imported");
    cy.contains("pAdTrack-CMV");
    cy.contains("CMV promoter");
  });
});
