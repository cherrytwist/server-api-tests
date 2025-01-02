export class UniqueIDGenerator {

  public static getID(): string {
    return Math.random()
      .toString(12)
      .slice(-6);
  }
}
