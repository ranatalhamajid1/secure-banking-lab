/**
 * Banking Event Dispatcher
 * Lightweight pub/sub event bus for cross-component communication.
 *
 * Supported events:
 *   auth:login, auth:logout
 *   user:updated
 *   transaction:processing, transaction:success, transaction:failed, transaction:refunded
 *   card:created, card:updated
 *   admin:updated
 *   notification:new
 */
class EventDispatcher {
    constructor() {
        this._listeners = {};
    }

    /**
     * Subscribe to an event.
     * Use '*' to listen to ALL events (wildcard / debug mode).
     */
    on(event, callback) {
        if (!this._listeners[event]) {
            this._listeners[event] = [];
        }
        this._listeners[event].push(callback);
    }

    /**
     * Unsubscribe from an event.
     */
    off(event, callback) {
        if (!this._listeners[event]) return;
        this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
    }

    /**
     * Emit an event with optional payload.
     * Also emits a wildcard '*' event for global debugging.
     */
    emit(event, payload) {
        // Fire exact listeners
        if (this._listeners[event]) {
            this._listeners[event].forEach(cb => {
                try {
                    cb(payload);
                } catch (err) {
                    console.error(`[EventDispatcher] Error in listener for "${event}":`, err);
                }
            });
        }

        // Fire wildcard listeners for debugging
        if (event !== '*' && this._listeners['*']) {
            this._listeners['*'].forEach(cb => {
                try {
                    cb({ event, payload });
                } catch (err) {
                    console.error('[EventDispatcher] Error in wildcard listener:', err);
                }
            });
        }
    }
}

// Singleton instance
const bankingEvents = new EventDispatcher();

// Development-mode global debug listener
if (import.meta.env.DEV) {
    bankingEvents.on('*', ({ event, payload }) => {
        console.log(
            `%c[BankEvent] ${event}`,
            'color: #8b5cf6; font-weight: bold;',
            payload !== undefined ? payload : ''
        );
    });
}

export default bankingEvents;
