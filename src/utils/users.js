const users = []

//adding user
const addUser = ({ id, username, room }) => {
    //clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // validate data
    if (!username || !room) {
        return {
            error: "Username and Room are required!"
        }
    }
    // check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // validate username
    if (existingUser) {
        return {
            error: "username is in use!"
        }
    }

    // store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

// removing user
const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
    if (index != -1) {
        // splice is used to remove an item using it's index and no of item to remove and returns an array of items
        // as we'll get only one item but in an array so using [0] to get that item as an object
        return users.splice(index, 1)[0]
    }
}

// get user
const getUser = (id) => {
    return users.find((user) => user.id === id)
}

// get users in room
const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}

module.exports = { addUser, removeUser, getUser, getUsersInRoom }