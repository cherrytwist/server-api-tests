export const uniqueId = Math.random()
  .toString(12)
  .slice(-6);

export class UniqueID {

  private getID(): string {
    return Math.random()
      .toString(12)
      .slice(-6);
  }
}
