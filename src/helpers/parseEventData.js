const parseEventData = (eventData) => {
    try {
        let json = JSON.parse(eventData)
        if (!json.message && json.json) {
            json.message = JSON.stringify(json.json)
        }
        return json
    } catch (e) {
        console.error(e, eventData)
    }
};

export default parseEventData;