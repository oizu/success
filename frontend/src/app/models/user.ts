export enum TokenType {
  Jwt,
  Patreon
}

export class User {
  public email: string | undefined;
  public tokens: string[] | undefined;
}
