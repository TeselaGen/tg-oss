// this is throwing a weird eslint error

//

import generateAnnotations from "./generateAnnotations";

export default function generateSequenceData({
  isProtein,
  sequenceLength = 1000,
  numFeatures,
  numParts,
  numPrimers,
  numTranslations
} = {}) {
  const proteinSequence = isProtein && generateSequence(sequenceLength, true);
  const sequence = !isProtein && generateSequence(sequenceLength);

  return {
    circular: isProtein ? false : Math.random() > 0.5,
    name: "p-" + Math.floor(Math.random * 100),
    description: "",
    isProtein,
    sequence,
    proteinSequence,
    translations: isProtein
      ? undefined
      : generateAnnotations(
          numTranslations || 5,
          0,
          sequenceLength - 1,
          sequenceLength / 3
        ),
    features: generateAnnotations(
      numFeatures || 10,
      0,
      sequenceLength - 1,
      sequenceLength / 3
    ),
    primers: isProtein
      ? undefined
      : generateAnnotations(numPrimers || 10, 0, sequenceLength - 1, 50),
    parts: generateAnnotations(
      numParts || 10,
      0,
      sequenceLength - 1,
      sequenceLength / 3
    )
  };
}

// export default tidyUpSequenceData(exampleData)

function generateSequence(m = 9, isProtein) {
  let s = "";
  const r = isProtein ? "" : "gatc";
  for (let i = 0; i < m; i++) {
    s += r.charAt(Math.floor(Math.random() * r.length));
  }
  return s;
}

// tnr: this is used to generate a very large, multi-featured sequence
// var string = "ggggcccccgggggccc";
// var reallyLongFakeSequence = "";
// for (var i = 1; i < 100000; i++) {
//   reallyLongFakeSequence += string;
//   if (i % 100 === 0) {
//     reallyLongFakeSequence += 'taafatg';
//     sequenceData.features.push({
//       id: i,
//       start: parseInt(i * 10),
//       end: parseInt(i * 10 + 100),
//       name: 'cooljim',
//       color: 'green',
//       forward: true,
//       annotationType: "feature"
//     });
//   }
// }
// sequenceData.sequence += reallyLongFakeSequence;
//
// export default function() {
//   var baseSeqData = {
//
//   }
//   function seqGen() {
//
//   }
// }
// "features" : [
//     {
//         "name" : "1",
//         "type" : "misc_feature",
//         "start" : 1,
//         "end" : 1,
//         "strand" : 1,
//         "notes" : [],
//         "color": 'blue'
//     },
//     {
//         "name" : "2",
//         "type" : "misc_feature",
//         "start" : 1,
//         "end" : 1,
//         "strand" : 1,
//         "notes" : [],
//         "color": 'blue'
//     },
//     {
//         "name" : "3",
//         "type" : "misc_feature",
//         "start" : 1,
//         "end" : 1,
//         "strand" : 1,
//         "notes" : [],
//         "color": 'blue'
//     },
//     {
//         "name" : "4",
//         "type" : "misc_feature",
//         "start" : 1,
//         "end" : 14,
//         "strand" : 1,
//         "notes" : [],
//         "color": 'blue'
//     },
//     {
//         "name" : "5",
//         "type" : "misc_feature",
//         "start" : 1,
//         "end" : 1,
//         "strand" : 1,
//         "notes" : [],
//         "color": 'blue'
//     },
//     {
//         "name" : "6",
//         "type" : "misc_feature",
//         "id" : "5590c1978fafgw979df000a4f02c7a",
//         "start" : 4,
//         "end" : 6,
//         "strand" : 1,
//         "notes" : [],
//         "color": 'orange'
//     },
//     {
//         "name" : "housemouserousepouse",
//         "type" : "misc_feature",
//         "id" : "5590c197897fs9df000a4f02c7a",
//         "start" : 4,
//         "end" : 6,
//         "strand" : 1,
//         "notes" : [],
//         "color": 'orange'
//     },
//     {
//         "name" : "housemouserousepouse",
//         "type" : "misc_feature",
//         "id" : "5590c1978979dasdfaf000a4f02c7a",
//         "start" : 4,
//         "end" : 6,
//         "strand" : 1,
//         "notes" : [],
//         "color": 'orange'
//     },
//     {
//         "name" : "housemouserousepouse",
//         "type" : "misc_feature",
//         "id" : "5590c197faas8979df000a4f02c7a",
//         "start" : 4,
//         "end" : 6,
//         "strand" : 1,
//         "notes" : [],
//         "color": 'orange'
//     },
//     {
//         "name" : "housemouserousepouse",
//         "type" : "misc_feature",
//         "id" : "5590c1978979df000a4f02c7aasd",
//         "start" : 4,
//         "end" : 6,
//         "strand" : 1,
//         "notes" : [],
//         "color": 'orange'
//     },
//     {
//         "name" : "house",
//         "type" : "misc_feature",
//         "id" : "5590c1978979df000a4f02c7b",
//         "start" : 70,
//         "end" : 90,
//         "strand" : 1,
//         "notes" : [],
//         "color": 'green'
//     },
//     {
//         "name" : "weer",
//         "type" : "misc_feature",
//         "id" : "5590c1d88979df000a4f02f5c",
//         "start" : 3,
//         "end" : 69,
//         "strand" : 1,
//         "notes" : [],
//         "color": 'red'
//     }
// ],
