
//
type Seconds = number;

// Take Unix seconds string and convert it to integer
function ParseSeconds(str: string): Seconds {
  if (str == '') {
    return NaN;
  }
  let seconds = +str;
  return seconds;
}

// Takes a Unix seconds integer and converts it into a human readable date
function FormatSeconds(sec: Seconds): string {
  if (isNaN(sec)) {
    return 'never';
  }
  const date = new Date(sec * 1000);
  return date.toDateString();
}

export {
  Seconds,

  ParseSeconds,
  FormatSeconds
};
