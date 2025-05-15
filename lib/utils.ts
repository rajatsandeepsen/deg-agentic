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