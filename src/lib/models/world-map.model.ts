import { Cell } from './cell.model'
import { Occupier, Coordinate, MapService } from './types.model'
import { translateCoordinate } from '../common/utils'

export class WorldMap implements MapService {
  private _matrix: Array<Array<Cell>>
  private _occupiers = new Array<Occupier>()

  constructor(width: number, height: number) {
    this._matrix = new Array(width).fill(null).map((_, x) => new Array(height).fill(null).map((_, y) => new Cell(x, y)))
  }

  findOccupierById(occupierId?: string): Occupier | undefined {
    return occupierId ? this._occupiers.find(o => o.id === occupierId) : undefined
  }

  findFirstOccupier(): Occupier | undefined {
    return this._occupiers.find(o => o.id)
  }

  put(occupier: Occupier, position: Coordinate) {
    const cells = this.calculateFootprint(occupier.width, occupier.height, position)
    cells.forEach(c => (c.occupierId = occupier.id))
    this._occupiers.push(occupier)
  }

  clear(occupier: Occupier) {
    const cells = this.calculateFootprint(occupier.width, occupier.height, occupier.position)
    cells.forEach(c => c.clear())
    this._occupiers = this._occupiers.filter(o => o.id !== occupier.id)
  }

  findPosition(occupierId: string): Coordinate | undefined {
    // This is the scanning method and it is slow.
    // In real world, this can be optimised using cache, index, and/or additional tracking logic.
    for (let x = 0; x < this._matrix.length; x++) {
      for (let y = 0; y < this._matrix[x].length; y++) {
        if (this._matrix[x][y].occupierId === occupierId) return { x, y }
      }
    }
    return undefined
  }

  calculateFootprint(width: number, height: number, position: Coordinate) {
    const cells = new Array<Cell>()
    for (let x = position.x; x < position.x + width; x++) {
      for (let y = position.y; y < position.y + height; y++) {
        const translatedX = translateCoordinate(x, this._matrix.length - 1)
        const translatedY = translateCoordinate(y, this._matrix[0].length - 1)
        cells.push(this._matrix[translatedX][translatedY])
      }
    }
    return cells
  }

  getAllOccupiersFootprint() {
    return Array.from(this._occupiers).flatMap(o => this.calculateFootprint(o.width, o.height, o.position))
  }
}