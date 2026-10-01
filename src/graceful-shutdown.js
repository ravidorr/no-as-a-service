export function createGracefulShutdown({
  server,
  timeoutMs,
  processRef = process,
  setTimeoutFn = setTimeout,
  clearTimeoutFn = clearTimeout,
  log = console.log,
  error = console.error,
  exit = process.exit.bind(process)
}) {
  let draining = false;
  let shutdownStarted = false;
  let deadlineTimerId;

  function isDraining() {
    return draining;
  }

  function clearDeadline() {
    if (deadlineTimerId !== undefined) {
      clearTimeoutFn(deadlineTimerId);
      deadlineTimerId = undefined;
    }
  }

  function finishShutdown() {
    clearDeadline();
    log('Graceful shutdown complete');
    exit(0);
  }

  function forceCloseRemainingConnections() {
    log(`Shutdown timeout of ${timeoutMs}ms reached, force-closing remaining connections`);
    server.closeAllConnections();
  }

  function shutdown(signal) {
    if (shutdownStarted) {
      error(`Received ${signal} again, forcing immediate exit`);
      exit(1);
      return;
    }

    shutdownStarted = true;
    draining = true;

    log(`Received ${signal}, starting graceful shutdown`);

    server.close(() => {
      finishShutdown();
    });
    server.closeIdleConnections();

    deadlineTimerId = setTimeoutFn(forceCloseRemainingConnections, timeoutMs);
  }

  function install() {
    processRef.on('SIGTERM', () => shutdown('SIGTERM'));
    processRef.on('SIGINT', () => shutdown('SIGINT'));
  }

  return {
    isDraining,
    install,
    shutdown
  };
}
