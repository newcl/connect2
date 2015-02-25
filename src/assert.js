/**
 * Created by chenliang on 15/2/25.
 */

function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed";
    }
}