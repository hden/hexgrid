const stream = require('stream')
const helpers = require('@turf/helpers')
const distance = require('@turf/distance').default

const base = Array.apply(null, Array(6)).map((_, i) => 2 * Math.PI / 6 * i)

module.exports = function hexGridStream (bbox = [], cellSide = 1, options = {}) {
  const properties = options.properties || {}
  const [west, south, east, north] = bbox
  const centerY = (south + north) / 2
  const centerX = (west + east) / 2

  const xFraction = cellSide * 2 / (distance([west, centerY], [east, centerY], options))
  const cellWidth = xFraction * (east - west)
  const yFraction = cellSide * 2 / (distance([centerX, south], [centerX, north], options))
  const cellHeight = yFraction * (north - south)
  const radius = cellWidth / 2

  const hexWidth = radius * 2
  const hexHeight = Math.sqrt(3) / 2 * cellHeight

  const boxWidth = east - west
  const boxHeight = north - south

  const xInterval = 3 / 4 * hexWidth
  const yInterval = hexHeight

  // adjust box_width so all hexagons will be inside the bbox
  const xSpan = (boxWidth - hexWidth) / (hexWidth - radius / 2)
  const xCount = Math.floor(xSpan)

  const xAdjust = ((xCount * xInterval - radius / 2) - boxWidth) / 2 - radius / 2 + xInterval / 2

  // adjust box_height so all hexagons will be inside the bbox
  const yCount = Math.floor((boxHeight - hexHeight) / hexHeight)

  let yAdjust = (boxHeight - yCount * hexHeight) / 2

  const hasOffsetY = yCount * hexHeight - boxHeight > hexHeight / 2
  if (hasOffsetY) {
    yAdjust -= hexHeight / 4
  }

  // Precompute cosines and sines of angles used in hexagon creation for performance gain
  const cosines = base.map(angle => Math.cos(angle))
  const sines = base.map(angle => Math.sin(angle))

  let x = 0
  let y = 0

  return new stream.Readable({
    objectMode: true,
    read (size) {
      const isOdd = x % 2 === 1

      if (y === 0 && isOdd) {
        return
      }
      if (y === 0 && hasOffsetY) {
        return
      }

      const centerX = x * xInterval + west - xAdjust
      let centerY = y * yInterval + south + yAdjust

      if (isOdd) {
        centerY -= hexHeight / 2
      }

      if (options.triangles === true) {
        // TODO: hexTriangles()
      } else {
        this.push(hexagon([centerX, centerY], cellWidth / 2, cellHeight / 2, properties, cosines, sines))
      }

      if (x < xCount) {
        x += 1
      }

      if (y < yCount) {
        y += 1
      }

      if (x >= xCount && x >= yCount) {
        return this.push(null)
      }
    }
  })
}

function hexagon (center, rx, ry, properties, cosines, sines) {
  const vertices = base.map((_, i) => {
    const x = center[0] + rx * cosines[i]
    const y = center[1] + ry * sines[i]
    return [x, y]
  })
  // first and last vertex must be the same
  vertices[vertices.length - 1] = vertices[0].slice()
  return helpers.polygon([vertices], properties)
}
