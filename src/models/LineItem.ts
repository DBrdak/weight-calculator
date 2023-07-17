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
    this.weightBrutto = round(init?.weightBrutto as number, 1)
    this.margin = init!.margin

    this.weightNetto = round(this.weightBrutto - this.containers * 2 - this.pallets * 18, 1)
    this.weightFV = round(this.weightNetto * (1 - this.margin * 0.01), 2)
  }
}

function round(n: number, digits: number): number {
  var multiplicator = Math.pow(10, digits);
  n = +(parseFloat((n * multiplicator).toFixed(11)))
  n = +(Math.round(n) / multiplicator).toFixed(digits)
  return n;
}

export class FormValues {
  name: string = ''
  weightBrutto: number | string = ''
  containers: number | string = ''
  pallets: number | string = ''
  margin: number = 0.5
}