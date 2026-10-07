export const languageKey = (id: string) => {
  if (typeof id !== 'string' || !/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/u.test(id)) {
    throw new TypeError('Language identifier must contain ASCII alphanumeric segments');
  }

  return id.toLowerCase();
};
