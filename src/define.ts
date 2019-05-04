export const DEFAULT_CLUSTER = "default";
export const DEFAULT_NAMESPACE = "application";
export const DEFAULT_REFRESH_INTERVAL = 5 * 60 * 1000;

export const ATOM_RETRY_DELAY = 10 * 1000;
export const DEFAULT_POLLING_RETRY_POLICY = (retries: number) => {
  const ret = {
    // Testing: allow tests cases to change the value
    delay: retries * ATOM_RETRY_DELAY,
    reset: false,
  };

  // Longer than 60 is non-sense,
  // because the max response time of
  if (retries >= 6) {
    ret.reset = true;
  }

  return ret;
};
