describe("copyPaste", function () {
  beforeEach(() => {
    cy.visit("");
  });
  it(`isProtein mode - copy genbank of protein`, () => {
    cy.get(`[data-test="moleculeType"]`).select("Protein");

    cy.contains(".veRowViewFeature", "araC")
      .first()
      .trigger("contextmenu", { force: true });
    cy.contains(".bp3-menu-item", "Copy").trigger("mouseover");
    cy.contains(".bp3-menu-item", "Copy Genbank").click();
    // cy.contains(".openVeCopy2", "Copy AA Sequence").click();
    // cy.contains(".bp3-menu-item", "Copy Reverse Complement").click();
    cy.window().then(() => {
      assert(window.Cypress.textToCopy.includes("879 aa"));
      assert(window.Cypress.textToCopy.includes("fcillaavsg"));
      assert(window.Cypress.textToCopy.includes("eelvgplyar"));
      assert(
        window.Cypress.seqDataToCopy.proteinSequence ===
          "fcillaavsgaegwgyygcdeelvgplyarslgassyyslltaprfarlhgisgwsprigdpnpwlqidlmkkhriravatqgsfnswdwvtrymllygdrvdswtpfyqrghnstffgnvnesavvrhdlhfhftaryirivplawnprgkiglrlglygcpykadilyfdgddaisyrfprgvsrslwdvfafsfkteekdglllhaegaqgdyvtlelegahlllhmslgsspiqprpghttvsaggvlndqhwhyvrvdrfgrdvnftldgyvqrfilngdferlnldtemfigglvgaarknlayrhnfrgcienvifnrvniadlavrrhsritfegkvafrcldpvphpinfggphnfvqvpgfprrgrlavsfrfrtwdltglllfsrlgdglghveltlsegqvnvsiaqsgrkklqfaagyrlndgfwhevnfvaqenhavisiddvegaevrvsypllirtgtsyffggcpkpasrwdchsnqtafhgcmellkvdgqlvnltlvegrrlgfyaevlfdtcgitdrcspnmcehdgrcyqswddficyceltgykgetchtplykesceayrlsgktsgnftidpdgsgplkpfvvycdirenrawtvvrhdrlwttrvtgssmerpflgaiqywnasweevsalanasqhceqwiefscynsrllntaggypysfwigrneeqhfywggsqpgiqrcacgldrscvdpalycncdadqpqwrtdkglltfvdhlpvtqvvigdtnrstseaqfflrplrcygdrnswntisfhtgaalrfppiranhsldvsfyfrtsapsgvflenmggpycqwrrpyvrvelntsrdvvfafdvgngdenltvhsddfefnddewhlvraeinvk"
      );
    });
  });
  it(`isProtein mode - copy protein sequence`, () => {
    cy.get(`[data-test="moleculeType"]`).select("Protein");
    cy.contains(".veRowViewFeature", "araC")
      .first()
      .trigger("contextmenu", { force: true });
    cy.contains(".bp3-menu-item", "Copy").trigger("mouseover");
    cy.contains(".bp3-menu-item", "Copy AA Sequence").click();
    // cy.contains(".openVeCopy2", "Copy AA Sequence").click();
    // cy.contains(".bp3-menu-item", "Copy Reverse Complement").click();
    cy.window().then(() => {
      assert(
        window.Cypress.textToCopy ===
          "FCILLAAVSGAEGWGYYGCDEELVGPLYARSLGASSYYSLLTAPRFARLHGISGWSPRIGDPNPWLQIDLMKKHRIRAVATQGSFNSWDWVTRYMLLYGDRVDSWTPFYQRGHNSTFFGNVNESAVVRHDLHFHFTARYIRIVPLAWNPRGKIGLRLGLYGCPYKADILYFDGDDAISYRFPRGVSRSLWDVFAFSFKTEEKDGLLLHAEGAQGDYVTLELEGAHLLLHMSLGSSPIQPRPGHTTVSAGGVLNDQHWHYVRVDRFGRDVNFTLDGYVQRFILNGDFERLNLDTEMFIGGLVGAARKNLAYRHNFRGCIENVIFNRVNIADLAVRRHSRITFEGKVAFRCLDPVPHPINFGGPHNFVQVPGFPRRGRLAVSFRFRTWDLTGLLLFSRLGDGLGHVELTLSEGQVNVSIAQSGRKKLQFAAGYRLNDGFWHEVNFVAQENHAVISIDDVEGAEVRVSYPLLIRTGTSYFFGGCPKPASRWDCHSNQTAFHGCMELLKVDGQLVNLTLVEGRRLGFYAEVLFDTCGITDRCSPNMCEHDGRCYQSWDDFICYCELTGYKGETCHTPLYKESCEAYRLSGKTSGNFTIDPDGSGPLKPFVVYCDIRENRAWTVVRHDRLWTTRVTGSSMERPFLGAIQYWNASWEEVSALANASQHCEQWIEFSCYNSRLLNTAGGYPYSFWIGRNEEQHFYWGGSQPGIQRCACGLDRSCVDPALYCNCDADQPQWRTDKGLLTFVDHLPVTQVVIGDTNRSTSEAQFFLRPLRCYGDRNSWNTISFHTGAALRFPPIRANHSLDVSFYFRTSAPSGVFLENMGGPYCQWRRPYVRVELNTSRDVVFAFDVGNGDENLTVHSDDFEFNDDEWHLVRAEINVK"
      );
      assert(
        window.Cypress.seqDataToCopy.proteinSequence ===
          "fcillaavsgaegwgyygcdeelvgplyarslgassyyslltaprfarlhgisgwsprigdpnpwlqidlmkkhriravatqgsfnswdwvtrymllygdrvdswtpfyqrghnstffgnvnesavvrhdlhfhftaryirivplawnprgkiglrlglygcpykadilyfdgddaisyrfprgvsrslwdvfafsfkteekdglllhaegaqgdyvtlelegahlllhmslgsspiqprpghttvsaggvlndqhwhyvrvdrfgrdvnftldgyvqrfilngdferlnldtemfigglvgaarknlayrhnfrgcienvifnrvniadlavrrhsritfegkvafrcldpvphpinfggphnfvqvpgfprrgrlavsfrfrtwdltglllfsrlgdglghveltlsegqvnvsiaqsgrkklqfaagyrlndgfwhevnfvaqenhavisiddvegaevrvsypllirtgtsyffggcpkpasrwdchsnqtafhgcmellkvdgqlvnltlvegrrlgfyaevlfdtcgitdrcspnmcehdgrcyqswddficyceltgykgetchtplykesceayrlsgktsgnftidpdgsgplkpfvvycdirenrawtvvrhdrlwttrvtgssmerpflgaiqywnasweevsalanasqhceqwiefscynsrllntaggypysfwigrneeqhfywggsqpgiqrcacgldrscvdpalycncdadqpqwrtdkglltfvdhlpvtqvvigdtnrstseaqfflrplrcygdrnswntisfhtgaalrfppiranhsldvsfyfrtsapsgvflenmggpycqwrrpyvrvelntsrdvvfafdvgngdenltvhsddfefnddewhlvraeinvk"
      );
    });
  });

  it("should show warning when pasted sequence is larger than the max insert size", () => {
    cy.get(`[data-test="moleculeType"]`).select("Protein");
    cy.tgToggle("addMaxInsertSize");
    cy.selectRange(10, 12);
    cy.contains(".veRowViewFeature", "araE")
      .first()
      .trigger("contextmenu", { force: true });
    // cy.contains(".bp3-menu-item", "Copy").trigger("mouseover")
    cy.contains(".bp3-menu-item", "Copy").click();
    cy.contains(".openVeCopy2", "Copy").realClick();

    cy.contains("Selection Copied");

    cy.get(`.veVectorInteractionWrapper:focused input`).trigger("paste", {
      force: true,
      clipboardData: {
        // we have to mock the paste event cause cypress doesn't actually trigger a paste event when typing cmd+v
        getData: type =>
          type === "application/json"
            ? JSON.stringify(window.Cypress.seqDataToCopy)
            : window.Cypress.seqDataToCopy.sequence,
        types: ["application/json"]
      }
    });

    cy.contains(
      "Sorry, the pasted sequence exceeds the maximum allowed length of 50"
    );
  });

  it("should show warning when inserting sequence not in the allowed insert chars", () => {
     cy.get(`[data-test="moleculeType"]`).select("Protein");
     cy.tgToggle("addAcceptedInsertChars");
    cy.contains("Part - pj5_00001 - Start: 1 End: 1384");
    cy.contains(".veRowViewPrimaryProteinSequenceContainer svg g", "M").click({
      force: true
    });

    cy.focused().type("{rightarrow}{rightarrow}");

    cy.get(".veRowViewCaret").trigger("contextmenu", { force: true });
    cy.contains(".bp3-menu-item", "Insert").click();
    cy.contains("Press ENTER to insert 0 AAs after AA 2");
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(0);
    cy.get(".sequenceInputBubble input").type("u");
    cy.contains('Invalid character(s) detected and removed: u');
  });

  it(`should be able to copy reverse complement`, () => {
    cy.selectRange(10, 12); //select some random range (we were seeing an error where the selection layer wasn't getting updated correctly)
    //right click a feature
    cy.contains(".veRowViewFeature", "araC")
      .first()
      .trigger("contextmenu", { force: true });
    cy.contains(".bp3-menu-item", "Copy").trigger("mouseover");
    cy.contains(".bp3-menu-item", "Copy Reverse Complement").click();
    cy.window().then(() => {
      assert(
        window.Cypress.seqDataToCopy.sequence ===
          "atggctgaagcgcaaaatgatcccctgctgccgggatactcgtttaatgcccatctggtggcgggtttaacgccgattgaggccaacggttatctcgatttttttatcgaccgaccgctgggaatgaaaggttatattctcaatctcaccattcgcggtcagggggtggtgaaaaatcagggacgagaatttgtttgccgaccgggtgatattttgctgttcccgccaggagagattcatcactacggtcgtcatccggaggctcgcgaatggtatcaccagtgggtttactttcgtccgcgcgcctactggcatgaatggcttaactggccgtcaatatttgccaatacggggttctttcgcccggatgaagcgcaccagccgcatttcagcgacctgtttgggcaaatcattaacgccgggcaaggggaagggcgctattcggagctgctggcgataaatctgcttgagcaattgttactgcggcgcatggaagcgattaacgagtcgctccatccaccgatggataatcgggtacgcgaggcttgtcagtacatcagcgatcacctggcagacagcaattttgatatcgccagcgtcgcacagcatgtttgcttgtcgccgtcgcgtctgtcacatcttttccgccagcagttagggattagcgtcttaagctggcgcgaggaccaacgtatcagccaggcgaagctgcttttgagcaccacccggatgcctatcgccaccgtcggtcgcaatgttggttttgacgatcaactctatttctcgcgggtatttaaaaaatgcaccggggccagcccgagcgagttccgtgccggttgtgaagaaaaagtgaatgatgtagccgtcaagttgtcataa"
      );
    });
  });
  it(`should be able to copy and paste normal sequence w features`, () => {
    cy.selectRange(10, 12); //select some random range (we were seeing an error where the selection layer wasn't getting updated correctly)
    //right click a feature
    cy.contains(".veRowViewFeature", "araD")
      .first()
      .trigger("contextmenu", { force: true });
    cy.get(`.veVectorInteractionWrapper:focus`).should("not.exist");
    // cy.contains(".bp3-menu-item", "Copy").trigger("mouseover")
    cy.contains(".bp3-menu-item", "Copy").click();
    cy.contains(".openVeCopy2", "Copy").realClick();
    cy.window().then(() => {
      assert(
        window.Cypress.seqDataToCopy.sequence ===
          "ttatgacaacttgacggctacatcattcactttttcttcacaaccggcacggaactcgctcgggctggccccggtgcattttttaaatacccgcgagaaatagagttgatcgtcaaaaccaacattgcgaccgacggtggcgataggcatccgggtggtgctcaaaagcagcttcgcctggctgatacgttggtcctcgcgccagcttaagacgctaatccctaactgctggcggaaaagatgtgacagacgcgacggcgacaagcaaacatgctgtgcgacgctggcgatatcaaaattgctgtctgccaggtgatcgctgatgtactgacaagcctcgcgtacccgattatccatcggtggatggagcgactcgttaatcgcttccatgcgccgcagtaacaattgctcaagcagatttatcgccagcagctccgaatagcgcccttccccttgcccggcgttaatgatttgcccaaacaggtcgctgaaatgcggctggtgcgcttcatccgggcgaaagaaccccgtattggcaaatattgacggccagttaagccattcatgccagtaggcgcgcggacgaaagtaaacccactggtgataccattcgcgagcctccggatgacgaccgtagtgatgaatctctcctggcgggaacagcaaaatatcacccggtcggcaaacaaattctcgtccctgatttttcaccaccccctgaccgcgaatggtgagattgagaatataacctttcattcccagcggtcggtcgataaaaaaatcgagataaccgttggcctcaatcggcgttaaacccgccaccagatgggcattaaacgagtatcccggcagcaggggatcattttgcgcttcagccat"
      );
      assert(window.Cypress.seqDataToCopy.features.length === 2);
      cy.contains("Selection Copied");
      // paste it back into the seq
      cy.get(`.veVectorInteractionWrapper:focus`);
      cy.get(`.veCircularViewFeature:contains("CmR"):first`).realClick();
      // cy.get(`[data-test="ve-draggable-tabs0"] .veVectorInteractionWrapper`).should("be.focused");
      cy.get(`.veCircularViewFeature:contains("araD") textPath`).should(
        "have.length",
        1
      );
      cy.get(`.veCircularViewFeature:contains("CmR") textPath`).should(
        "have.length",
        1
      );

      cy.get(`.veVectorInteractionWrapper:focused input`).trigger("paste", {
        force: true,
        clipboardData: {
          // we have to mock the paste event cause cypress doesn't actually trigger a paste event when typing cmd+v
          getData: type =>
            type === "application/json"
              ? JSON.stringify(window.Cypress.seqDataToCopy)
              : window.Cypress.seqDataToCopy.sequence,
          types: ["application/json"]
        }
      });
      cy.get(`.veCircularViewFeature:contains("araD") textPath`).should(
        "have.length",
        2
      );
      cy.get(`.veCircularViewFeature:contains("CmR") textPath`).should(
        "not.exist"
      );
    });
  });
  it(`copy options should toggle correctly when triggered from a selection layer`, () => {
    //right click a feature
    cy.contains(".veRowViewFeature", "araC")
      .first()
      .trigger("contextmenu", { force: true });
    // cy.contains(".bp3-menu-item", "Copy").trigger("mouseover")
    cy.contains(".bp3-menu-item", "Copy").trigger("mouseover", { force: true });
    cy.contains(".bp3-menu-item", "Copy Options").trigger("mouseover", {
      force: true
    });
    cy.get(
      `.bp3-menu-item:contains("Include Features") .bp3-icon-small-tick`
    ).should("exist");
    cy.contains(".bp3-menu-item", "Include Features").click({ force: true });
    cy.get(
      `.bp3-menu-item:contains("Include Features") .bp3-icon-small-tick`
    ).should("not.exist");
  });
});
