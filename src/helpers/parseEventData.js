const parseEventData = (eventData) => {
    try {
        let json = JSON.parse(eventData)
        let message;
        if (json.json && json.json.message) {
            message = json.json.message
        } else if (json.message) {
            message = json.message
        } else if (json.json) {
            message = JSON.stringify(json.json)
        }
        if (message) {
            json.message = message
        }
        return json
    } catch (e) {
        console.error(e, eventData)
    }
};

export default parseEventData;