const socket = io()
// elements
const $messageForm = document.querySelector("#message-form")
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocButton = document.querySelector("#send-location")
const $messages = document.querySelector("#messages")

// templates
const messageTemplate = document.querySelector("#message-template").innerHTML
const locationMessageTemplate = document.querySelector("#location-message-template").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

// options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true }) // ignore ? sign

const autoscroll = () => {
    // new message element
    const $newMessage = $messages.lastElementChild
    // height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    // visible height
    const visibleHeight = $messages.offsetHeight
    // height of messages container
    const containerHeight = $messages.scrollHeight
    // how far have i scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
    // const element = $messages.lastElementChild
    // element.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" })
}
// receiving the message from server
socket.on("message", (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})
// receiving the location message from server
socket.on("locationMessage", (message) => {
    console.log(message)
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

// receiving room name and users list when user joins or leaves
socket.on("roomData", ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector("#sidebar").innerHTML = html
})
// getting message from html form input and sending that to server.
$messageForm.addEventListener("submit", (e) => {
    e.preventDefault()
    // disable send message button
    $messageFormButton.setAttribute('disabled', 'disabled')
    const message = e.target.elements.message.value
    socket.emit("sendMessage", message, (error) => {
        // enable send message button
        $messageFormButton.removeAttribute('disabled')
        // clearing input field and refocusing on input field
        $messageFormInput.value = ""
        $messageFormInput.focus()
        if (error) {
            return console.log(error)
        }
        console.log("Delivered!")
    })
})

$sendLocButton.addEventListener('click', () => {

    if (!navigator.geolocation) {
        return alert("Geolocation is not supported by your browser")
    }

    // disable send loc button
    $sendLocButton.setAttribute("disabled", "disabled")
    navigator.geolocation.getCurrentPosition((position) => {
        // console.log(position)
        const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }
        socket.emit("sendLocation", location, () => {
            // enable send loc button
            $sendLocButton.removeAttribute("disabled")
            console.log("Location Shared!")
        })
    })
})

socket.emit("join", { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})
