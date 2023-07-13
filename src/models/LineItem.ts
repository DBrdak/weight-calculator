export interface LineItem {
  name: string
  weightBrutto: number
  weightNetto: number
  weightFV: number
  containers: number
  pallets: number
}

export class LineItem implements LineItem {
  constructor(init?: FormValues) {
    this.name = init?.name!
    this.containers = init?.containers as number
    this.pallets = init?.pallets as number
    this.weightBrutto = init?.weightBrutto as number

    this.weightNetto = this.weightBrutto - this.containers * 2 - this.pallets * 18
    this.weightFV = Math.round(this.weightNetto * 9.95) / 10
  }
}

export class FormValues {
  name: string = ''
  weightBrutto: number | string = ''
  containers: number | string = ''
  pallets: number | string = ''
}