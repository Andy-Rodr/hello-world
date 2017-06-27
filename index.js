exports.handler = function (event, context) {
    try {
        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/** Called when the session starts */
function onSessionStarted(sessionStartedRequest, session) {
    // add any session init logic here
}

/** Called when the user invokes the skill without specifying what they want. */
function onLaunch(launchRequest, session, callback) {
    var speechOutput = "<audio src = 'https://s3-us-west-1.amazonaws.com/ningenkimine/minion_bottom.mp3'/>"
    var reprompt = "Which sign are you interested in? You can find out about Aquaries, Aries, Taurus, Pisces, Gemini, Geminis, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, and Capricorn."
    var header = "Zodiac Facts!"
    var shouldEndSession = false
    var sessionAttributes = {
        "speechOutput" : speechOutput,
        "repromptText" : reprompt
    }
    callback(sessionAttributes, buildSSMLResponse(header, speechOutput, reprompt, shouldEndSession))
}

/** Called when the user specifies an intent for this skill. */
function onIntent(intentRequest, session, callback) {
    var intent = intentRequest.intent
    var intentName = intentRequest.intent.name;

    // dispatch custom intents to handlers here
    if (intentName == "GetZodiacFactIntent") {
        handleGetZodiacFactRequest(intent, session, callback)
    } else if (intentName == "AMAZON.HelpIntent") {
        handleHelpRequest(intent, session, callback)
    } else if (intentName == "AMAZON.StopIntent" || intentName == "AMAZON.CancelIntent") {
        handleFinishSessionRequest(intent, session, callback)
    } else {
        throw "Invalid intent"
    }
}

/** Called when the user ends the session - is not called when the skill returns shouldEndSession=true. */
function onSessionEnded(sessionEndedRequest, session) {

}

// ------- Helper functions to build responses for Alexa -------
function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSSMLResponse(title, output, repromptText, shouldEndSession){
    return{
        outputSpeech: {
            type: "SSML",
            ssml: output
        },
        card:{
            type: "Simple",
            title: title,
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        }
    }
}

function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}

var zodiacSigns = {
  "aries" : {
        "fact" : "Aries is the first sign of the zodiac. Those who are Aries are independent and courageous. They enjoy leading others and bringing excitement into the lives of others. An Aries is enthusiastic and very goal-oriented"
    },
    "taurus" : {
        "fact" : "The second sign of the zodiac, those who are a Taurus are solid and fight for what they want. A Taurus is very easy going but can also be stubborn. A Taurus can be procrastinators but also have a good-work ethic."
    },
    "gemini" : {
        "fact" : "Gemini is the third sign of the zodiac. Geminis have many sides and are known for their energy. They are very talkative and are considered social butterflies. A Gemini will always take their lives in the direction they want to go."
    },
    "cancer" : {
        "fact" : "Cancer is the fourth sign of the zodiac. This sign is marked by inconsistency. They enjoy security but also seek adventure. A Cancer is not very predictable and always keep others guessing.",
    },
    "leo" : {
        "fact" : "Leo is the fifth sign in the zodiac. Leos have high self esteem and are very devoted. They are also very kind and generous. A Leo is known for being hot tempered yet forgiving."
    },
    "virgo" : {
        "fact" : "The sixth sign of the zodiac, Virgo is very mind oriented. They are constantly analyzing and thinking. They enjoy bettering themselves and those around them."
    },
    "libra" : {
        "fact" : "The seventh sign of the zodiac, Libras are known for their diplomatic nature. They get along well with everyone and are ambitious. They have very expensive taste and work hard to make money."
    }, 
    "scorpio" : {
        "fact" : "The eight sign of the zodiac, Scorpios are very intense. They like to question everything and work hard at making sense of things. Scorpios treat others with kindness and loyalty."
    },
    "sagittarius" : {
        "fact" : "The ninth sign of the zodiac, a Sagittarius has a very positive outlook on life. They have vibrant personalities and enjoy meeting new people. They can also be reckless."
    },
    "capricorn" : {
        "fact" : "The 10th sign of the zodiac, those who are Capricorns are marked by their ambitious nature. They have very active minds and always have to be in control of their lives."
    }, 
    "aquarius" : {
        "fact" : "Aquarius is the 11th sign of the zodiac. Aquarians don't always care what others think about them. They take each opportunity they have and work towards formulating new ideas."
    }, 
    "pisces" : {
        "fact" : "Pisces is the 12th and last sign of the zodiac. Those who are Pisces are extremely sensitive and reserved. They like to escape from reality. A Pisces is a very good listener and friend."
    }
}

function handleGetZodiacFactRequest(intent, session, callback) {
    var sign = intent.slots.Zodiac.value.toLowerCase()
    sign = matchSign(sign)
    if (!zodiacSigns[sign]) {
        var speechOutput = "That's not a Zodiac sign. Try asking about another sign."
        var repromptText = "Try asking about another Zodiac sign."
        var header = "Does Not Exist"
    } else {
        var fact = zodiacSigns[sign].fact
        var speechOutput = fact  
        var repromptText = "Do you want to hear about more Zodiac signs?"
        var header = capitalizeFirst(sign)
    }
    var shouldEndSession = false
    callback(session.attributes, buildSpeechletResponse(header, speechOutput, repromptText, shouldEndSession))
}

function matchSign(sign) {
  switch(sign) {
    case "geminis":
        return "gemini"
    case "cancers":
        return "cancer"
    case "leos":
        return "leo"
    case "virgos":
        return "virgo"
    case "libras":
        return "libra"
    case "scorpios":
        return "scorpio"
    case "sagittariuses":
        return "sagittarius"
    case "capricorns":
        return "capricorn"
    default:
        return sign
   }
}

function capitalizeFirst(s) {
    return s.charAt(0).toUpperCase() + s.slice(1)
}

function handleGetHelpRequest(intent, session, callback) {
    // Ensure that session.attributes has been initialized
    if (!session.attributes) {
        session.attributes = {};
    }
    var speechOutput = "I can tell you facts about all the different Zodiac signs, including Aquaries, Aries, Taurus, Pisces, Gemini, Geminis, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, and Capricorn. Which sign are you interested in?"
    var repromptText = speechOutput
    var shouldEndSession = false
    callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput, repromptText, shouldEndSession))
}

function handleFinishSessionRequest(intent, session, callback) {
    // End the session with a "Good bye!"
    callback(session.attributes,
        buildSpeechletResponseWithoutCard("Good bye! Thank you for using Zodiac Facts!", "", true));
}
