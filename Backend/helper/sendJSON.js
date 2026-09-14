/*
Put here functions that send JSON responses to the client. For example, you can have a function that sends a 200 OK response with some data, or a function that sends a 400 Bad Request response with an error message.
For example, you can have a function like this:

export function sendOk(res, data) {
13
sendJson(res, 200, data);
14
}

OR 

export function sendInternalError(
46
res,
47
message = "Internal server error",
48
) {
49
sendJson(res, 500, { error: message });
50
}
*/