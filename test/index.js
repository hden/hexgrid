/* eslint-env node, mocha */
const fs = require('fs')
const path = require('path')
const assert = require('assert')
const JSONStream = require('JSONStream')
const hexGrid = require('../')

// const directories = {
//   in: path.join(__dirname, 'test', 'in') + path.sep,
//   out: path.join(__dirname, 'test', 'out') + path.sep
// }
//
// const fixtures = fs.readdirSync(directories.in).map(filename => {
//   return {
//     filename,
//     name: path.parse(filename).name,
//     json: require(directories.in + filename)
//   }
// })

describe('hex-grid', () => {
  const bbox = [122.93349314581921, 20.422740332935973, 153.98686576033427, 45.557331085205114]
  hexGrid(bbox, 100)
    .pipe(JSONStream.stringify(false))
    .pipe(process.stdout)
})
