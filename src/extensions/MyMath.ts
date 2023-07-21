class MyMath{
  static round(n: number, digits: number): number {
    var multiplicator = Math.pow(10, digits);
    n = +(parseFloat((n * multiplicator).toFixed(11)))
    n = +(Math.round(n) / multiplicator).toFixed(digits)
    return n;
  }
}

export default MyMath