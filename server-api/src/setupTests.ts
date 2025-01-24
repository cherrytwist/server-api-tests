/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */

// define websocket as a global, because it will fail with ReferenceError: WebSocket is not defined
(global as any).WebSocket = require('ws');


