export const getSearchTripsQuery = () => {
  return `
query planTrip($fromPlace: String, $toPlace: String, $pageCursor: String) {
  trip(
    from: {
      place: $fromPlace
    },
    to: {
      place: $toPlace
    },
    pageCursor: $pageCursor,
  ) {
    nextPageCursor
    tripPatterns {
      expectedStartTime
      expectedEndTime
      duration
      distance
      legs {
        mode
        transportSubmode
        expectedStartTime
        expectedEndTime
        distance
        fromPlace {
          quay {
            publicCode
            name
            stopPlace {
              id
            }
          }
        }
        toPlace {
          quay {
            publicCode
            name
            stopPlace {
              id
            }
          }
        }
        line {
          id
          description
          transportMode
          publicCode
          authority {
            id
            name
            url
          }
        }
        fromEstimatedCall {
          destinationDisplay {
            frontText
            via
          }
        }
      }
    }
  }
}`;
};
