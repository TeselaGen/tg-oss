/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<> {
    /**
     * uploadFile
     * uploads a file to a dropzone uploader
     * @param selector - cypress selector class for drop element
     * @param fileUrl - file url relative to the fixtures folder
     * @param type - file type
     * @param noFileList - whether the upload doesn't have a file list (custom render), this will ignore the checks for file loading
     * @example
     * cy.uploadFile(".tg-dropzone", "tubes.csv", "text/csv")
     */
    uploadFile(
      selector: string,
      fileUrl: string,
      type?: string,
      noFileList?: boolean
    ): void;

    /**
     * uploadBlobFile
     * uploads a string to a dropzone uploader by converting it to a browser file
     * @param selector - cypress selector class for drop element
     * @param stringContent - file contents
     * @param filename - file name
     * @param type - file type
     * @param noFileList - whether the upload doesn't have a file list (custom render), this will ignore the checks for file loading
     * @example
     * cy.uploadBlobFile(".tg-dropzone", "contents of file", "tubes.csv", "text/csv")
     */
    uploadBlobFile(
      selector: string,
      stringContent: string,
      filename: string,
      type?: string,
      noFileList?: boolean
    ): void;
    /**
     * uploadBlobFiles
     * uploads a string to a dropzone uploader by converting it to a browser file
     * @param selector - cypress selector class for drop element
     * @param stringContent - file contents
     * @param filename - file name
     * @param type - file type
     * @param noFileList - whether the upload doesn't have a file list (custom render), this will ignore the checks for file loading
     * @example
     * cy.uploadBlobFiles(".tg-dropzone", [{ name: "test.csv", contents: "oj,oij", type: "text/csv"}, { name: "test2.csv", contents: "oj,oij", type: "text/csv"}])
     */
    uploadBlobFiles(
      selector: string,
      files: object[],
      noFileList?: boolean
    ): void;

    /**
     * tgToggle
     * toggle a demo switch
     * @example
     * cy.tgToggle("propertiesOverridesExample")  //defaults to true
     * cy.tgToggle("propertiesOverridesExample", false)
     *
     */
    tgToggle(toggleId: string, toggleOnOrOff: boolean): void;

    /**
     * This function will drag an element from the source to the destination
     * @param dragSelector
     * @param dropSelector
     */
    dragBetween(dragSelector, dropSelector): void;
  }
}
