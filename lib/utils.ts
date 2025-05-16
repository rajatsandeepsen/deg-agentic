export const triedAsync = <T, U = Error>(
  promise: Promise<T>,
  errorExt?: object
): Promise<{
  data: undefined;
  error: U;
  isSuccess: false;
} | {
  data: T;
  error: undefined;
  isSuccess: true;
}> => promise
  .then((data: T) => ({
      data,
      error: undefined,
      isSuccess: true as true,
  }))
  .catch((err: U) => {
      if (errorExt) {
          const parsedError = Object.assign({}, err, errorExt);
          return {
              error: parsedError,
              data: undefined,
              isSuccess: false as false,
          }
      }

      return {
          error: err,
          data: undefined,
          isSuccess: false,
      }
  });

const stringToURL = (str: string, secure: "LOCAL" | string | undefined): URL => {
	if (!str.startsWith("http")) {
		if (secure === "LOCAL" || secure === undefined)
			return new URL(`http://${str}`);
		return new URL(`https://${str}`);
	}
	return new URL(str);
};

export const getURL = (origin: string | undefined): string =>
	stringToURL(origin ?? "http://localhost:3000", origin).toString();