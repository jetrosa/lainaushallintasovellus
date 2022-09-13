/**
 * Used for formatting dates, can be used for other formattings as well
 */

function format(value, format, lng) {
    if (format.startsWith("date")) {
      return formatDate(value, format, lng);
    } else {
        return value;
    }
}

function formatDate(value, format, lng) {
    const options = toOptions(format);
    return options === null
        ? value
        : new Intl.DateTimeFormat(lng, options).format(value);
}

function toOptions(format) {
    // Handle case with no options, such as {{today, date}}
    if (format.trim() === "date") {
        return {};
    } else {
        try {
            return JSON.parse(toJsonString(format));
        } catch (error) {
            console.log(error);
            return null;
        }
    }
}

function toJsonString(format) {
    const inner = format
        .trim()
        .replace("date", "")
        .replace("(", "")
        .replace(")", "")
        .split(";")
        .map((param) =>
            param
            .split(":")
            .map((name) => 
                '"' + name.trim() + '"'
            )
            .join(":"),
        )
        .join(",");
    return "{" + inner + "}";
}

export default format;
