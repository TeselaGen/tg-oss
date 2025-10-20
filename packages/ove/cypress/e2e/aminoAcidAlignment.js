describe("Amino Acid MSA", function () {
  beforeEach(() => {
    cy.visit("#/Alignment");
    cy.get(".bp3-select select").select("Protein MSA");
  });

  it("it should display the consensus sequence", function () {
    cy.contains(
      `[data-alignment-track-index="0"] .alignmentTrackName`,
      "Consensus"
    );
  });
  it("it should display the sequence identity", function () {
    cy.contains(
      `[data-alignment-track-index="1"] .alignmentTrackName`,
      "142 AAs"
    );
    cy.contains(
      `[data-alignment-track-index="1"] .alignmentTrackName`,
      "Identical Positions: 135"
    );
    cy.contains(
      `[data-alignment-track-index="1"] .alignmentTrackName`,
      "Identity: 95.07%"
    );
  });
  it("it should display the sequence properties", function () {
    cy.contains(
      `[data-alignment-track-index="1"] .alignmentTrackName`,
      "Chicken Hemoglobin Alpha"
    ).click();
    cy.contains(".sidebar-container", "Properties");
    cy.contains("Name").should("exist");
    cy.contains(
      ".sidebar-container .property-name",
      "Chicken Hemoglobin Alpha"
    );
    cy.contains("Length").should("exist");
    cy.contains(".sidebar-container .property-length", "142");
    cy.contains("Molecular Weight").should("exist");
    cy.contains(".sidebar-container .property-molecular-weight", "15160.40 Da");
    cy.contains("Isoelectric Point").should("exist");
    cy.contains(".sidebar-container .property-isoelectric-point", "8.63");
    cy.contains("Extinction Coefficient").should("exist");
    cy.contains(".sidebar-container .property-extinction-coefficient", "9970");
    cy.contains("Mismatches").should("exist");
    cy.contains(".sidebar-container .property-mismatches", "7/7");
    cy.contains("Region").should("exist");
    cy.contains(".sidebar-container .property-region", "1 - 142");

    cy.contains("Amino Acid Frequencies").should("exist");
    const aminoAcids = [
      "A (Ala)",
      "C (Cys)",
      "D (Asp)",
      "E (Glu)",
      "F (Phe)",
      "G (Gly)",
      "H (His)",
      "I (Ile)",
      "K (Lys)",
      "L (Leu)",
      "M (Met)",
      "N (Asn)",
      "P (Pro)",
      "Q (Gln)",
      "R (Arg)",
      "S (Ser)",
      "T (Thr)",
      "V (Val)",
      "W (Trp)",
      "Y (Tyr)"
    ];
    aminoAcids.forEach((aa, i) => {
      cy.contains(
        `.sidebar-container .sidebar-table .property-amino-acid-${i}`,
        aa
      );
    });
  });

  it("it should display the amino acid visibility options", function () {
    cy.get(".tg-alignment-visibility-toggle").click();
    cy.contains("Physical Properties").should("exist");
    cy.contains("Serine Threonine").should("exist");
    cy.contains("Labile Sites").should("exist");
    cy.contains("Color Scheme").should("exist");
    cy.contains("Plot").should("exist");

    cy.contains("Physical Properties")
      .click()
      .then(() => {
        cy.contains("Hydrophobicity").should("exist");
        cy.contains("Polar").should("exist");
        cy.contains("Negative").should("exist");
        cy.contains("Positive").should("exist");
        cy.contains("Charged").should("exist");
        cy.contains("Aliphatic").should("exist");
        cy.contains("Aromatic").should("exist");
      });

    cy.contains("Plot")
      .click()
      .then(() => {
        cy.contains("Conservation").should("exist");
        cy.contains("Properties").should("exist");
      });
  });

  it("it should display the labile sites", function () {
    cy.get(".tg-alignment-visibility-toggle").click();
    cy.contains("Labile Sites").click();
    cy.get(`.veAlignmentViewLabileSiteLine`);
  });

  it("it should display the amino acid plots", function () {
    cy.get(".tg-alignment-visibility-toggle").click();
    cy.contains("Plot")
      .click()
      .then(() => {
        cy.contains("Conservation").click();
      });

    cy.get(
      `[data-alignment-track-index="0"] > .veLinearView > .ve-linear-view-conservation-plot`
    );

    cy.contains("Plot")
      .click()
      .then(() => {
        cy.contains(".plot-properties", "Properties").click();
      });

    cy.get(
      `[data-alignment-track-index="0"] > .veLinearView > .ve-linear-view-property-analysis-plot`
    );
  });
});
