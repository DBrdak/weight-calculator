import MyMath from "../extensions/MyMath"

export interface LineItem {
  name: string
  weightBrutto: number
  weightNetto: number
  weightFV: number
  containers: number
  pallets: number
  margin: number
}

export class LineItem implements LineItem {
  constructor(init?: FormValues) {
    this.name = init?.name!
    this.containers = init?.containers as number
    this.pallets = init?.pallets as number
    this.weightBrutto = MyMath.round(init?.weightBrutto as number, 1)
    this.margin = init!.margin

    this.weightNetto = MyMath.round(this.weightBrutto - this.containers * 2 - this.pallets * 18, 1)
    this.weightFV = MyMath.round(this.weightNetto * (1 - this.margin * 0.01), 2)
  }
}

export class FormValues {
  name: string = ''
  weightBrutto: number | string = ''
  containers: number | string = ''
  pallets: number | string = ''
  margin: number = 0.5
}