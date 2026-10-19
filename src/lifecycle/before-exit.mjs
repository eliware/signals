export const withEventLoopKeepAlive = async (operation) => {
  const timer = setInterval(() => {}, 2 ** 31 - 1);
  try {
    return await operation();
  } finally {
    clearInterval(timer);
  }
};
