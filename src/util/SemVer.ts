const isnumber = (char: number): boolean => {
  return char >= '0'.charCodeAt(0) && char <= '9'.charCodeAt(0);
};

export default class SemVer {
  major: number;
  minor: number;
  revision: number;
  bugfix: string;
  build: number;

  constructor(input: string) {
    const split = input.split('.');
    this.major = Number.parseInt(split[0]);
    this.minor = Number.parseInt(split[1]);
    const revision_bugfix = split[2];
    this.build = parseInt(split[3]);

    let index_of_bufgix = -1;
    for (let i = 0; i < revision_bugfix.length; i++) {
      const char_at = revision_bugfix.charCodeAt(i);
      if (!isnumber(char_at)) {
        index_of_bufgix = i;
        break;
      }
    }

    if (index_of_bufgix != -1) {
      this.revision = parseInt(revision_bugfix.slice(0, index_of_bufgix));
      this.bugfix = revision_bugfix.slice(index_of_bufgix);
    } else {
      this.revision = parseInt(revision_bugfix);
      this.bugfix = '';
    }
  }
}
