// Lambda Function code for Alexa.
// Paste this into your index.js file. 

const Alexa = require("ask-sdk");
const https = require("https");
const axios = require('axios');

const invocationName = "track my train";

function getMemoryAttributes() {   const memoryAttributes = {
       "history":[],

       "launchCount":0,
       "lastUseTimestamp":0,

       "lastSpeechOutput":{},
       "nextIntent":[]
   };
   return memoryAttributes;
};

const maxHistorySize = 20; // remember only latest 20 intents 


// 1. Intent Handlers =============================================

const AMAZON_CancelIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.CancelIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();


        let say = 'Okay, talk to you later! ';

        return responseBuilder
            .speak(say)
            .withShouldEndSession(true)
            .getResponse();
    },
};

const AMAZON_HelpIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let intents = getCustomIntents();
        let sampleIntent = randomElement(intents);

        let say = 'You asked for help. '; 

        // let previousIntent = getPreviousIntent(sessionAttributes);
        // if (previousIntent && !handlerInput.requestEnvelope.session.new) {
        //     say += 'Your last intent was ' + previousIntent + '. ';
        // }
        // say +=  'I understand  ' + intents.length + ' intents, '

        say += ' Here something you can ask me, arrival and departure time of BLUE line at Decatur station' ;

        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const AMAZON_StopIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.StopIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();


        let say = 'Okay, talk to you later! ';

        return responseBuilder
            .speak(say)
            .withShouldEndSession(true)
            .getResponse();
    },
};


const GetEastboundArrivalTime_Handler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'GetEastboundArrivalTime';
    },
    async handle(handlerInput) {
        const responseBuilder = handlerInput.responseBuilder;

        try {
            // Make API request to get train data
            const apiResponse = await axios.get('http://developer.itsmarta.com/RealtimeTrain/RestServiceNextTrain/GetRealtimeArrivals', {
                params: {
                    apikey: '6b697454-c8d0-4c65-88e7-834a805bfb52',
                },
            });

            // Filter data for DECATUR STATION in the Eastbound direction
            const eastboundTrains = apiResponse.data.filter(train => train.STATION === 'DECATUR STATION' && train.DIRECTION === 'E');

            if (eastboundTrains.length > 0) {
                // Get the first train's arrival time
                const firstTrainArrivalTime = eastboundTrains[0].NEXT_ARR;
                const destination = eastboundTrains[0].DESTINATION;

                const say = `The next Eastbound BLUE line train to DECATUR STATION will arrive at ${firstTrainArrivalTime}, Which is going toward ${destination}`;

                return responseBuilder
                    .speak(say)
                    .getResponse();
            } else {
                const say = 'Sorry, no Eastbound trains to DECATUR STATION are available at the moment.';
                return responseBuilder
                    .speak(say)
                    .getResponse();
            }
        } catch (error) {
            console.error('Error fetching train data:', error);
            const say = 'Sorry, an error occurred while fetching train data.';
            return responseBuilder
                .speak(say)
                .getResponse();
        }
    },
};

const GetWestboundDepartureTime_Handler = {
  canHandle(handlerInput) {
      const request = handlerInput.requestEnvelope.request;
      return request.type === 'IntentRequest' && request.intent.name === 'GetWestboundDepartureTime';
  },
  async handle(handlerInput) {
      const responseBuilder = handlerInput.responseBuilder;

      try {
          // Make API request to get train data
          const apiResponse = await axios.get('http://developer.itsmarta.com/RealtimeTrain/RestServiceNextTrain/GetRealtimeArrivals', {
              params: {
                  apikey: '6b697454-c8d0-4c65-88e7-834a805bfb52',
              },
          });

          // Filter data for DECATUR STATION in the Westbound direction
          const westboundTrains = apiResponse.data.filter(train => train.STATION === 'DECATUR STATION' && train.DIRECTION === 'W');

          if (westboundTrains.length > 0) {
              // Get the first train's departure time
              const firstTrainDepartureTime = westboundTrains[0].NEXT_ARR;
              const destination = westboundTrains[0].DESTINATION;

              const say = `The next Westbound BLUE line train from DECATUR STATION will depart at ${firstTrainDepartureTime}, Which going towards ${destination}`;

              return responseBuilder
                  .speak(say)
                  .getResponse();
          } else {
              const say = 'Sorry, no Westbound trains from DECATUR STATION are available at the moment.';
              return responseBuilder
                  .speak(say)
                  .getResponse();
          }
      } catch (error) {
          console.error('Error fetching train data:', error);
          const say = 'Sorry, an error occurred while fetching train data.';
          return responseBuilder
              .speak(say)
              .getResponse();
      }
  },
};

const LaunchRequest_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const responseBuilder = handlerInput.responseBuilder;

        let say = 'hello' + ' and welcome to ' + invocationName + ' ! how can i help you';

        let skillTitle = capitalize(invocationName);


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .withStandardCard('Welcome!', 
              'Hello!\n you can ask arrival and departure of blue line ' + skillTitle,
               welcomeCardImg.smallImageUrl, welcomeCardImg.largeImageUrl)
            .getResponse();
    },
};

const SessionEndedHandler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
        return handlerInput.responseBuilder.getResponse();
    }
};

const ErrorHandler =  {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const request = handlerInput.requestEnvelope.request;

        console.log(`Error handled: ${error.message}`);
        // console.log(`Original Request was: ${JSON.stringify(request, null, 2)}`);

        return handlerInput.responseBuilder
            .speak('Sorry, an error occurred.  Please say again.')
            .reprompt('Sorry, an error occurred.  Please say again.')
            .getResponse();
    }
};


// 2. Constants ===========================================================================

    // Here you can define static data, to be used elsewhere in your code.  For example: 
    //    const myString = "Hello World";
    //    const myArray  = [ "orange", "grape", "strawberry" ];
    //    const myObject = { "city": "Boston",  "state":"Massachusetts" };

const APP_ID = undefined;  // TODO replace with your Skill ID (OPTIONAL).

// 3.  Helper Functions ===================================================================

function capitalize(myString) {

     return myString.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); }) ;
}

 
function randomElement(myArray) { 
    return(myArray[Math.floor(Math.random() * myArray.length)]); 
} 
 
function stripSpeak(str) { 
    return(str.replace('<speak>', '').replace('</speak>', '')); 
} 
 
 
 
const welcomeCardImg = { 
    smallImageUrl: "https://atlanta.urbanize.city/sites/default/files/styles/2018_article_gallery_image_2000w/public/2022-12/new%20MARTA%20rail%20cars%208.png?itok=ZqWJys9K", 
    largeImageUrl: "https://atlanta.urbanize.city/sites/default/files/styles/2018_article_gallery_image_2000w/public/2022-12/new%20MARTA%20rail%20cars%208.png?itok=ZqWJys9K" 
 
 
}; 
 
const DisplayImg1 = { 
    title: 'Jet Plane', 
    url: 'https://s3.amazonaws.com/skill-images-789/display/plane340_340.png' 
}; 
const DisplayImg2 = { 
    title: 'Starry Sky', 
    url: 'https://s3.amazonaws.com/skill-images-789/display/background1024_600.png' 
 
}; 
 
function getCustomIntents() { 
    const modelIntents = model.interactionModel.languageModel.intents; 
 
    let customIntents = []; 
 
 
    for (let i = 0; i < modelIntents.length; i++) { 
 
        if(modelIntents[i].name.substring(0,7) != "AMAZON." && modelIntents[i].name !== "LaunchRequest" ) { 
            customIntents.push(modelIntents[i]); 
        } 
    } 
    return customIntents; 
} 
 
function getSampleUtterance(intent) { 
 
    return randomElement(intent.samples); 
 
} 
 
function getPreviousIntent(attrs) { 
 
    if (attrs.history && attrs.history.length > 1) { 
        return attrs.history[attrs.history.length - 2].IntentRequest; 
 
    } else { 
        return false; 
    } 
 
} 
 
function getPreviousSpeechOutput(attrs) { 
 
    if (attrs.lastSpeechOutput && attrs.history.length > 1) { 
        return attrs.lastSpeechOutput; 
 
    } else { 
        return false; 
    } 
 
} 
 
function timeDelta(t1, t2) { 
 
    const dt1 = new Date(t1); 
    const dt2 = new Date(t2); 
    const timeSpanMS = dt2.getTime() - dt1.getTime(); 
    const span = { 
        "timeSpanMIN": Math.floor(timeSpanMS / (1000 * 60 )), 
        "timeSpanHR": Math.floor(timeSpanMS / (1000 * 60 * 60)), 
        "timeSpanDAY": Math.floor(timeSpanMS / (1000 * 60 * 60 * 24)), 
        "timeSpanDesc" : "" 
    }; 
 
 
    if (span.timeSpanHR < 2) { 
        span.timeSpanDesc = span.timeSpanMIN + " minutes"; 
    } else if (span.timeSpanDAY < 2) { 
        span.timeSpanDesc = span.timeSpanHR + " hours"; 
    } else { 
        span.timeSpanDesc = span.timeSpanDAY + " days"; 
    } 
 
 
    return span; 
 
} 
function filterTrains(data, direction, station) {
  return data.filter(train => train.DIRECTION === direction && train.STATION === station);
}
function getTrainData(apiEndpoint, apiKey) {
  return new Promise((resolve, reject) => {
      https.get(`${apiEndpoint}?apikey=${apiKey}`, (response) => {
          let data = '';
          response.on('data', (chunk) => {
              data += chunk;
          });
          response.on('end', () => {
              resolve(JSON.parse(data));
          });
      }).on('error', (error) => {
          reject(error);
      });
  });
}
 
 
const InitMemoryAttributesInterceptor = { 
    process(handlerInput) { 
        let sessionAttributes = {}; 
        if(handlerInput.requestEnvelope.session['new']) { 
 
            sessionAttributes = handlerInput.attributesManager.getSessionAttributes(); 
 
            let memoryAttributes = getMemoryAttributes(); 
 
            if(Object.keys(sessionAttributes).length === 0) { 
 
                Object.keys(memoryAttributes).forEach(function(key) {  // initialize all attributes from global list 
 
                    sessionAttributes[key] = memoryAttributes[key]; 
 
                }); 
 
            } 
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes); 
 
 
        } 
    } 
}; 
 
const RequestHistoryInterceptor = { 
    process(handlerInput) { 
 
        const thisRequest = handlerInput.requestEnvelope.request; 
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes(); 
 
        let history = sessionAttributes['history'] || []; 
 
        let IntentRequest = {}; 
        if (thisRequest.type === 'IntentRequest' ) { 
 
            let slots = []; 
 
            IntentRequest = { 
                'IntentRequest' : thisRequest.intent.name 
            }; 
 
            if (thisRequest.intent.slots) { 
 
                for (let slot in thisRequest.intent.slots) { 
                    let slotObj = {}; 
                    slotObj[slot] = thisRequest.intent.slots[slot].value; 
                    slots.push(slotObj); 
                } 
 
                IntentRequest = { 
                    'IntentRequest' : thisRequest.intent.name, 
                    'slots' : slots 
                }; 
 
            } 
 
        } else { 
            IntentRequest = {'IntentRequest' : thisRequest.type}; 
        } 
        if(history.length > maxHistorySize - 1) { 
            history.shift(); 
        } 
        history.push(IntentRequest); 
 
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes); 
 
    } 
 
}; 
 

// 4. Exports handler function and setup ===================================================
const skillBuilder = Alexa.SkillBuilders.standard();
exports.handler = skillBuilder
    .addRequestHandlers(
        AMAZON_CancelIntent_Handler, 
        AMAZON_HelpIntent_Handler, 
        AMAZON_StopIntent_Handler, 
        GetEastboundArrivalTime_Handler, 
        GetWestboundDepartureTime_Handler, 
        LaunchRequest_Handler, 
        SessionEndedHandler
    )
    .addErrorHandlers(ErrorHandler)
    .addRequestInterceptors(InitMemoryAttributesInterceptor)
    .addRequestInterceptors(RequestHistoryInterceptor)

    .lambda();


// End of Skill code -------------------------------------------------------------
// Static Language Model for reference

const model = {
  "interactionModel": {
    "languageModel": {
      "invocationName": "train tracker",
      "intents": [
        {
          "name": "AMAZON.CancelIntent",
          "samples": []
        },
        {
          "name": "AMAZON.HelpIntent",
          "samples": []
        },
        {
          "name": "AMAZON.StopIntent",
          "samples": []
        },
        {
          "name": "HelloWorldIntent",
          "slots": [],
          "samples": [
            "hello",
            "how are you",
            "say hi world",
            "say hi",
            "hi",
            "say hello world",
            "say hello"
          ]
        },
        {
          "name": "AMAZON.NavigateHomeIntent",
          "samples": []
        },
        {
          "name": "AMAZON.FallbackIntent",
          "samples": []
        },
        {
          "name": "GetEastboundArrivalTime",
          "slots": [],
          "samples": [
            "What time does the Eastbound BLUE line arrive",
            "Eastbound BLUE line arrival time",
            "Eastbound BLUE line arrival",
            "What is the arrival time for the Eastbound BLUE line"
          ]
        },
        {
          "name": "GetWestboundDepartureTime",
          "slots": [],
          "samples": [
            "What time does the Westbound BLUE line depart",
            "Westbound BLUE line departure time",
            "Westbound BLUE line departure",
            "What is the departure time for the Westbound BLUE line"
          ]
        },
        {
          "name": "LaunchRequest"
        }
      ],
      "types": []
    }
  }
};
