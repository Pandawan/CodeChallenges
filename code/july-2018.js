/* July 2018 challenge */


// Throw an invalid argument error
function errorInvalid(match, argument, type) {
  // Just throw an error, ain't nobody got time for that :P
  throw Error(`Invalid argument for ${match}, given ${argument} (${typeof argument}). Expected ${type}.`);
}

// Check whether or not the given string is a hex number
function isHex(h) {
  const a = typeof h === 'string' ? h : parseInt(h, 16);
  return (a.toString(16) === h.toString().toLowerCase());
}

// Use , as thousand separators for the given number
function numberWithCommas(x) {
  const parts = x.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

function handleOptions(value, options, type) {
  if (!options) return value;
  // This checks if there are more than 2 of ['+', ' ', '('] together
  // OR that it has any character that doesn't match the extra options criteria
  const regex = /(?<![+ (])(?:[+ (]{1})(?![+ (]+)|(?:0\d*)|(?:,)/g;
  let m;
  const match = [];
  // Need a weird do/while loop to run through every single option
  /* eslint-disable-next-line */
  while (m = regex.exec(options)) {
    match.push(m[0]);
  }
  // TODO: If needed, sort the match array so that 0X args go first
  // (prevents 0+NUMBER when doing +03)

  // , is only valid for %d
  if (options.includes(',') && type !== 'd') {
    throw Error(`Invalid options in ${options}, ',' is only valid for '%d'`);
  }

  let final = value;
  match.forEach((item) => {
    if (item === '+' && parseInt(value, 10) > 0) final = `+${final}`;
    if (item === ' ' && parseInt(value, 10) > 0) final = ` ${final}`;
    if (item === '(') final = `(${final})`;
    if (item === ',') final = numberWithCommas(final);
    // 0 is a bit more complex
    if (item.substring(0, 1) === '0') {
      // Remove 0x from hex length
      const count = isHex(value) ? value.toString().length - 1 : value.toString().length;
      const n = item.substring(1, item.length);
      // Add padding based on n
      if (count < n) {
        final = new Array(n - count).join('0') + final;
      }
    }
  });
  return final;
}

// Main printf function
function printf(string, ...args) {
  const regex = /(?:%[+ 0\d(,]*[sdxXfn])|(?:%%)/g;
  // Start at -1 because arrays start at 0 and we're incrementing count at start
  let count = -1;
  const newString = string.replace(regex, (match) => {
    // Get the last character for type (because they can have extra options)
    const lastChar = match.substr(match.length - 1, 1);
    // Get any middle characters
    const middleChars = match.length > 2 ? match.substring(1, match.length - 1) : null;


    // %% -> %
    if (match === '%%') return '%';

    // %n -> \n
    if (match === '%n') return '\n';

    // Increment count for arg # (not for %n and %% so put it after them)
    count += 1;
    const argument = args[count];

    // %s -> string
    if (lastChar === 's') {
      // Check type
      if (typeof argument !== 'string') {
        return errorInvalid(match, argument, 'string');
      }
      return argument;
    }

    // %d -> number
    if (lastChar === 'd' || lastChar === 'f') {
      // Check type
      if (typeof argument !== 'number') {
        errorInvalid(match, argument, 'number');
      }
      return handleOptions(argument, middleChars, lastChar);
    }

    // %x -> lowercase hex
    if (lastChar === 'x') {
      // Check type
      if (typeof argument !== 'string' && isHex(argument)) {
        errorInvalid(match, argument, 'hex');
      }
      return handleOptions(argument, middleChars, lastChar).toLowerCase();
    }

    // %X -> uppercase hex
    if (lastChar === 'X') {
      // Check type
      if (typeof argument !== 'string' && isHex(argument)) {
        errorInvalid(match, argument, 'hex');
      }
      return handleOptions(argument, middleChars, lastChar).toUpperCase();
    }

    return match;
  });

  // Print final result
  console.log(newString);
}

/* TEST */
printf('begin %0s%d end', 'hello', 42);
printf('%03d', 4);
printf('%03d', 1234);
printf('%,08d', 12400);
printf('%03+d', 12);
