export class JsonStrictSerializer {
  type = 'jsonStrict';

  encode(data: unknown): string {
    return JSON.stringify(data);
  }

  decode(data: string): unknown {
    return JSON.parse(data);
  }
}
