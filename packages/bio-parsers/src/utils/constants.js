export default {
    untitledSequenceName: 'Untitled Sequence'
};

export const gbDivisions = {
    // https://www.ncbi.nlm.nih.gov/Sitemap/samplerecord.html#GenBankDivisionB
    PRI: true,  //- primate sequences
    ROD: true,  //- rodent sequences
    MAM: true,  //- other mammalian sequences
    VRT: true,  //- other vertebrate sequences
    INV: true,  //- invertebrate sequences
    PLN: true,  //- plant, fungal, and algal sequences
    BCT: true,  //- bacterial sequences
    VRL: true,  //- viral sequences
    PHG: true,  //- bacteriophage sequences
    SYN: true,  //- synthetic sequences
    UNA: true,  //- unannotated sequences
    EST: true,  //- EST sequences (expressed sequence tags)
    PAT: true,  //- patent sequences
    STS: true,  //- STS sequences (sequence tagged sites)
    GSS: true,  //- GSS sequences (genome survey sequences)
    HTG: true,  //- HTG sequences (high-throughput genomic sequences)
    HTC: true,  //- unfinished high-throughput cDNA sequencing
    ENV: true,  //- environmental sampling sequences
    CON: true,  //- sequence assembly instructions on how to construct contigs from multiple GenBank records.
  }