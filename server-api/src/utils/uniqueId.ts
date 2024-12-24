export const uniqueId2 = Math.random()
  .toString(12)
  .slice(-6);

export class UniqueIDGenerator {

  public static getID(): string {
    return Math.random()
      .toString(12)
      .slice(-6);
  }
}
