describe("Amino Acid MSA", function () {
  beforeEach(() => {
    cy.visit("#/Alignment");
    cy.get(".bp3-select select").select("Protein MSA");
  });

  it("should display all amino acid MSA features and functionality", function () {
    // Check consensus sequence is displayed
    cy.contains(
      `[data-alignment-track-index="0"] .alignmentTrackName`,
      "Consensus"
    );

    // Check sequence identity information is displayed
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
      "Identity: 95.1%"
    );

    // Check sequence properties are displayed in the sidebar
    cy.contains(
      `[data-alignment-track-index="1"] .alignmentTrackName`,
      "Chicken Hemoglobin Alpha"
    ).click();
    cy.contains(".ove-sidebar-container", "Properties");
    cy.contains("Name").should("exist");
    cy.contains(
      ".ove-sidebar-container .property-name",
      "Chicken Hemoglobin Alpha"
    );
    cy.contains("Length").should("exist");
    cy.contains(".ove-sidebar-container .property-length", "142");
    cy.contains("Molecular Weight").should("exist");
    cy.contains(
      ".ove-sidebar-container .property-molecular-weight",
      "15160.40 Da"
    );
    cy.contains("Isoelectric Point").should("exist");
    cy.contains(".ove-sidebar-container .property-isoelectric-point", "8.63");
    cy.contains("Extinction Coefficient").should("exist");
    cy.contains(
      ".ove-sidebar-container .property-extinction-coefficient",
      "9970"
    );
    cy.contains("Mismatches").should("exist");
    cy.contains(".ove-sidebar-container .property-mismatches", "7/7");
    cy.contains("Region").should("exist");
    cy.contains(".ove-sidebar-container .property-region", "1 - 142");

    // Check amino acid frequencies are displayed
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
        `.ove-sidebar-container .sidebar-table .property-amino-acid-${i}`,
        aa
      );
    });

    // Check amino acid visibility options
    cy.get(".tg-alignment-visibility-toggle").click();

    // Check labile sites
    cy.get(`.veAlignmentViewLabileSiteLine`).should("not.exist");
    cy.contains("Labile Sites").click();
    cy.get(`.veAlignmentViewLabileSiteLine`);

    // Check conservation plot
    cy.contains("Plot").click();

    cy.get(
      `[data-alignment-track-index="0"] .veLinearView .ve-linear-view-conservation-plot`
    ).should("not.exist");
    cy.contains("Conservation").click();

    cy.get(
      `[data-alignment-track-index="0"] .veLinearView .ve-linear-view-conservation-plot`
    );

    // Check properties plot
    cy.get(
      `[data-alignment-track-index="0"] .veLinearView .ve-linear-view-property-analysis-plot`
    ).should("not.exist");

    cy.contains(".plot-properties", "Properties").click();

    cy.get(
      `[data-alignment-track-index="0"] .veLinearView .ve-linear-view-property-analysis-plot`
    );
  });
});
