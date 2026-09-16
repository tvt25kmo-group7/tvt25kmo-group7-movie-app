import { deleteUserById } from "../services/userService.js";

const deleted = await deleteUserById(userId, pool);

if (!deleted) {
    //send 404 Not Found
}